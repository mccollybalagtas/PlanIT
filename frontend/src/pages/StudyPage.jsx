import { useState, useEffect, useCallback } from 'react';
import { studyApi } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, Badge, FileDropzone, FilePreview, RadialProgress } from '../components/ui';
import {
  PlusIcon, BookOpenIcon, TrashIcon,
  AcademicCapIcon, PlayIcon
} from '@heroicons/react/24/outline';
import { playSound } from '../utils/sound';
import toast from 'react-hot-toast';

function FlashcardReviewer({ cards, onComplete }) {
  const [index, setIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [flipped, setFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpenIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="font-medium text-gray-900 dark:text-gray-50 mb-2">No flashcards in this set</h3>
        <p className="text-gray-500 dark:text-gray-400">Add flashcards to start studying</p>
      </div>
    );
  }

  const card = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  const handleAnswer = (quality) => {
    playSound.click();
    if (quality >= 3) {
      playSound.taskComplete();
    }
    if (index < cards.length - 1) {
      setIndex(index + 1);
      setShowAnswer(false);
      setFlipped(false);
    } else {
      toast.success(`Study session complete! ${cards.length} cards reviewed.`);
      playSound.notification();
      onComplete();
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
    setShowAnswer(!showAnswer);
    playSound.click();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6 overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>

      <div className="text-center mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400">Card {index + 1} of {cards.length}</p>
      </div>

      <div
        className="relative h-72 cursor-pointer mb-6 perspective"
        onClick={handleFlip}
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 transform ${flipped ? 'rotate-y-180' : ''}`}
        >
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-2xl glass-panel backface-hidden">
            <p className="text-xl font-medium text-gray-900 dark:text-gray-50 px-6">{showAnswer ? card.back : card.front}</p>
          </div>
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-gray-800/50 rounded-2xl glass-panel backface-hidden rotate-y-180">
            <p className="text-lg text-gray-900 dark:text-gray-50 px-6">{card.back}</p>
          </div>
        </div>
      </div>

      {!showAnswer ? (
        <div className="flex justify-center">
          <Button icon={<PlayIcon className="w-5 h-5" />} onClick={handleFlip}>Show Answer</Button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          <Button variant="danger" onClick={() => handleAnswer(1)}>Didn't know</Button>
          <Button variant="warning" onClick={() => handleAnswer(3)}>Hard</Button>
          <Button variant="success" onClick={() => handleAnswer(5)}>Easy</Button>
        </div>
      )}

      <button
        onClick={() => onComplete()}
        className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      >
        End session
      </button>
    </div>
  );
}

export function StudyPage() {
  const [studySets, setStudySets] = useState([]);
  const [studyStats, setStudyStats] = useState({ totalSets: 0, mastery: 0, totalCards: 0, reviewedCards: 0, totalFiles: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  const [form, setForm] = useState({ title: '', subject: 'General', description: '', color: '#6366f1', dueDate: '' });
  const [selectedSet, setSelectedSet] = useState(null);
  const [reviewerMode, setReviewerMode] = useState(false);
  const [draggedFiles, setDraggedFiles] = useState([]);

  const urlParams = new URLSearchParams(window.location.search);
  const setId = urlParams.get('set');

  const resetForm = () => {
    setForm({ title: '', subject: 'General', description: '', color: '#6366f1', dueDate: '' });
  };

  const fetchSets = useCallback(async () => {
    setLoading(true);
    try {
      const [res, statsRes] = await Promise.all([studyApi.getSets(), studyApi.getStats()]);
      setStudySets(res.data.studySets);
      setStudyStats(statsRes.data.stats);
      if (setId) {
        const found = res.data.studySets.find(s => String(s.id) === setId);
        if (found) setSelectedSet(found);
      }
    } catch (error) {
      toast.error('Failed to load study sets');
    } finally {
      setLoading(false);
    }
  }, [setId]);

  useEffect(() => {
    fetchSets();
  }, [fetchSets]);

  const handleSaveSet = async (e) => {
    e.preventDefault();
    try {
      if (editingSet) {
        const res = await studyApi.updateSet(editingSet.id, form);
        setStudySets(prev => prev.map(s => s.id === editingSet.id ? res.data.studySet : s));
      } else {
        const res = await studyApi.createSet(form);
        setStudySets([res.data.studySet, ...studySets]);
      }
      toast.success(editingSet ? 'Study set updated' : 'Study set created');
      setModalOpen(false);
      setEditingSet(null);
      resetForm();
    } catch (error) {
      toast.error('Failed to save study set');
    }
  };

  const handleUploadFiles = async () => {
    if (!selectedSet || draggedFiles.length === 0) return;
    try {
      const files = await Promise.all(draggedFiles.map(async (f) => {
        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(f);
        });
        return { name: f.name, type: f.type, data: base64Data };
      }));
      const res = await studyApi.uploadFiles({ studySetId: selectedSet.id, files });
      toast.success(`${res.data.files.length} file(s) uploaded`);
      setDraggedFiles([]);
      fetchSets();
    } catch (error) {
      toast.error('Failed to upload files');
    }
  };

  const handleDeleteSet = async (setId) => {
    if (!confirm('Are you sure you want to delete this study set?')) return;
    try {
      await studyApi.deleteSet(setId);
      toast.success('Study set deleted');
      fetchSets();
    } catch (error) {
      toast.error('Failed to delete study set');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Study Center</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage flashcards, study materials, and track your progress</p>
        </div>
        <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => { setEditingSet(null); resetForm(); setModalOpen(true); }}>
          New Study Set
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card><CardContent className="pt-6"><RadialProgress value={studyStats.totalSets > 0 ? 100 : 0} max={100} color="indigo" label="Total Sets" sublabel={studyStats.totalSets.toString()} /></CardContent></Card>
        <Card><CardContent className="pt-6"><RadialProgress value={studyStats.mastery} max={100} color="green" label="Mastery" sublabel={`${studyStats.mastery}%`} /></CardContent></Card>
        <Card><CardContent className="pt-6"><RadialProgress value={studyStats.totalCards > 0 ? (studyStats.reviewedCards / studyStats.totalCards) * 100 : 0} max={100} color="purple" label="Cards" sublabel={`${studyStats.reviewedCards}/${studyStats.totalCards} reviewed`} /></CardContent></Card>
        <Card><CardContent className="pt-6"><RadialProgress value={studyStats.totalFiles > 0 ? 100 : 0} max={100} color="blue" label="Files" sublabel={`${studyStats.totalFiles} saved`} /></CardContent></Card>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><div className="h-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded" /></Card>
          ))}
        </div>
      ) : studySets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <AcademicCapIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="font-medium text-gray-900 dark:text-gray-50 mb-2">No study sets yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Create your first study set to start learning</p>
            <Button icon={<PlusIcon className="w-5 h-5" />} onClick={() => { setEditingSet(null); resetForm(); setModalOpen(true); }}>
              Create Study Set
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {studySets.map((set) => (
            <Card key={set.id} hover>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-3 h-3 rounded-full`} style={{ backgroundColor: set.color }} />
                  <Badge variant="info">{set.subject}</Badge>
                </div>
                <h3 className="font-bold text-lg text-gray-900 dark:text-gray-50 mb-2">{set.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{set.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span>{set.flashcards?.length || 0} flashcards</span>
                  <span>{set.files?.length || 0} files</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { setSelectedSet(set); setReviewerMode(true); }}>
                    <PlayIcon className="w-4 h-4 mr-1" />
                    Study
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { setEditingSet(set); resetForm(); setForm({ title: set.title, subject: set.subject, description: set.description, color: set.color, dueDate: set.dueDate ? new Date(set.dueDate).toISOString().split('T')[0] : '' }); setModalOpen(true); }}>
                    Edit
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => handleDeleteSet(set.id)}>
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingSet(null); resetForm(); }}
        title={editingSet ? 'Edit Study Set' : 'New Study Set'}
        size="md"
      >
        <form onSubmit={handleSaveSet} className="space-y-4">
          <Input label="Title" name="title" value={form.title} onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))} required placeholder="e.g. Biology Chapter 1" />
          <Input label="Subject" name="subject" value={form.subject} onChange={(e) => setForm(prev => ({ ...prev, subject: e.target.value }))} placeholder="e.g. Biology" />
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="input resize-none"
              placeholder="What is this study set about?"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Color" name="color" type="color" value={form.color} onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))} />
            <Input label="Due Date" name="dueDate" type="date" value={form.dueDate} onChange={(e) => setForm(prev => ({ ...prev, dueDate: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditingSet(null); resetForm(); }}>Cancel</Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Modal>

      {selectedSet && (
        <Modal
          isOpen={reviewerMode}
          onClose={() => { setReviewerMode(false); setSelectedSet(null); }}
          title={reviewerMode ? `${selectedSet.title} - Study Mode` : ''}
          size="xl"
        >
          {selectedSet.flashcards && selectedSet.flashcards.length > 0 ? (
            <FlashcardReviewer
              cards={selectedSet.flashcards}
              onComplete={() => setReviewerMode(false)}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 mb-4">No flashcards in this set</p>
              <Button onClick={() => setReviewerMode(false)}>Back</Button>
            </div>
          )}
        </Modal>
      )}

      {selectedSet && !reviewerMode && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Study Materials - {selectedSet.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FileDropzone
              onFiles={(files) => {
                const filesWithPreview = files.map(f => ({ ...f, preview: URL.createObjectURL(f) }));
                setDraggedFiles(filesWithPreview);
              }}
            />
            {draggedFiles.length > 0 && (
              <div className="flex flex-wrap gap-3 mt-4">
                {draggedFiles.map((file, i) => (
                  <FilePreview key={i} file={file} onRemove={() => setDraggedFiles(prev => prev.filter((_, idx) => idx !== i))} />
                ))}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setDraggedFiles([])}>Cancel</Button>
              <Button onClick={handleUploadFiles}>Upload Files</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
