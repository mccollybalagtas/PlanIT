import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { noteApi } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, SelectMenu } from '../components/ui';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function NotesPage() {
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({ title: '', content: '', category: 'general', tags: '' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchNotes = useCallback(async () => {
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      const res = await noteApi.getAll(params);
      setNotes(res.data.notes);
    } catch (error) {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => { fetchNotes(); }, [fetchNotes]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.content) { toast.error('Content is required'); return; }
    try {
      const res = await noteApi.create(formData);
      setNotes([res.data.note, ...notes]);
      setModalOpen(false);
      resetForm();
      toast.success('Note created');
    } catch (error) {
      toast.error('Failed to create note');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await noteApi.update(editingNote._id, formData);
      setNotes(notes.map(n => n._id === editingNote._id ? { ...n, ...formData } : n));
      setModalOpen(false);
      setEditingNote(null);
      resetForm();
      toast.success('Note updated');
    } catch (error) {
      toast.error('Failed to update note');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this note?')) return;
    try {
      await noteApi.delete(id);
      setNotes(notes.filter(n => n._id !== id));
      toast.success('Note deleted');
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', category: 'general', tags: '' });
  };

  const openEditModal = (note) => {
    setEditingNote(note);
    setFormData({ title: note.title || '', content: note.content || '', category: note.category || 'general', tags: (note.tags || []).join(', ') });
    setModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Notes</h1>
          <p className="text-gray-600 dark:text-gray-400">Your quick capture and rich text notes</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingNote(null); setModalOpen(true); }} icon={<PlusIcon className="w-5 h-5" />}>New Note</Button>
      </div>

      <div className="relative">
        <input type="text" placeholder="Search notes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">{[1,2].map(i => <Card key={i}><div className="h-32 bg-gray-200 dark:bg-gray-700 rounded" /></Card>)}</div>
      ) : notes.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><PlusIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-400 mb-4">No notes yet. Capture your thoughts!</p><Button onClick={() => { resetForm(); setEditingNote(null); setModalOpen(true); }} icon={<PlusIcon className="w-4 h-4" />}>Create Note</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note, idx) => (
            <motion.div key={note._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
              <Card className="neon-card hover:shadow-glass-hover cursor-pointer" onClick={() => navigate(`/notes/${note._id}`)}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-100 truncate flex-1">{note.title || 'Untitled'}</h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                      <button onClick={(e) => { e.stopPropagation(); openEditModal(note); }} className="p-1 rounded text-gray-400 hover:text-indigo-400"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); handleDelete(note._id); }} className="p-1 rounded text-gray-400 hover:text-red-400"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-3">{note.content}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{note.category}</span>
                    <span>{format(new Date(note.createdAt), 'MMM d')}</span>
                  </div>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {note.tags.map((tag, i) => <span key={i} className="text-xs bg-indigo-500/15 text-indigo-300 px-2 py-0.5 rounded-full">{tag}</span>)}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingNote(null); resetForm(); }} title={editingNote ? 'Edit Note' : 'New Note'} size="lg">
        <form onSubmit={editingNote ? handleUpdate : handleCreate} className="space-y-5">
          <Input label="Title" name="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="Note title" />
          <div>
            <label className="label">Content</label>
            <textarea name="content" value={formData.content} onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))} rows={8} className="input resize-none font-mono text-sm" placeholder="Write your thoughts..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectMenu value={formData.category} options={[{ value: 'personal', label: 'Personal' }, { value: 'work', label: 'Work' }, { value: 'ideas', label: 'Ideas' }, { value: 'meeting', label: 'Meeting' }, { value: 'general', label: 'General' }]} onChange={(v) => setFormData(prev => ({ ...prev, category: v }))} className="w-full" />
            <Input label="Tags" name="tags" value={formData.tags} onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))} placeholder="tag1, tag2, tag3" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditingNote(null); resetForm(); }}>Cancel</Button>
            <Button type="submit">{editingNote ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
