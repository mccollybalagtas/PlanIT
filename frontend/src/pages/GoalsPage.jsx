import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { goalApi } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Modal, Badge, SelectMenu } from '../components/ui';
import { motion } from 'framer-motion';
import { PlusIcon, TrashIcon, PencilIcon, FlagIcon, CheckCircleIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  'not-started': 'default',
  'in-progress': 'blue',
  'completed': 'green',
  'overdue': 'red',
};

const PRIORITY_COLORS = {
  low: 'gray', medium: 'yellow', high: 'orange', urgent: 'red',
};

export function GoalsPage() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', targetDate: '', priority: 'medium', category: 'personal', progress: 0 });
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const fetchGoals = useCallback(async () => {
    try {
      const params = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterCategory !== 'all') params.category = filterCategory;
      const res = await goalApi.getAll(params);
      setGoals(res.data.goals);
    } catch (error) {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  }, [filterStatus, filterCategory]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.targetDate) {
      toast.error('Title and target date are required');
      return;
    }
    try {
      const res = await goalApi.create(formData);
      setGoals([res.data.goal, ...goals]);
      setModalOpen(false);
      resetForm();
      toast.success('Goal created');
    } catch (error) {
      toast.error('Failed to create goal');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await goalApi.update(editingGoal._id, formData);
      setGoals(goals.map(g => g._id === editingGoal._id ? { ...g, ...formData } : g));
      setModalOpen(false);
      setEditingGoal(null);
      resetForm();
      toast.success('Goal updated');
    } catch (error) {
      toast.error('Failed to update goal');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this goal?')) return;
    try {
      await goalApi.delete(id);
      setGoals(goals.filter(g => g._id !== id));
      toast.success('Goal deleted');
    } catch (error) {
      toast.error('Failed to delete goal');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', targetDate: '', priority: 'medium', category: 'personal', progress: 0 });
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);
    setFormData({ title: goal.title, description: goal.description || '', targetDate: goal.targetDate ? goal.targetDate.split('T')[0] : '', priority: goal.priority, category: goal.category, progress: goal.progress });
    setModalOpen(true);
  };

  const overdueGoals = goals.filter(g => g.status === 'overdue').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your targets and milestones</p>
        </div>
        <Button onClick={() => { resetForm(); setEditingGoal(null); setModalOpen(true); }} icon={<PlusIcon className="w-5 h-5" />}>New Goal</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Goals', value: goals.length, icon: FlagIcon, color: 'purple' },
          { label: 'Completed', value: goals.filter(g => g.status === 'completed').length, icon: CheckCircleIcon, color: 'green' },
          { label: 'Overdue', value: overdueGoals, icon: CalendarDaysIcon, color: 'red' },
        ].map((stat, idx) => (
          <Card key={stat.label} className="neon-card" style={{ animationDelay: `${idx * 100}ms` }}>
            <CardContent className="pt-6 flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-neon-${stat.color}/15`} style={{ boxShadow: `0 0 15px rgba(${stat.color === 'purple' ? '168,85,247' : stat.color === 'green' ? '34,197,94' : '239,68,68'},0.3)` }}>
                <stat.icon className={`w-6 h-6 text-neon-${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold font-mono tracking-wider text-gray-100">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <SelectMenu value={filterStatus} options={[{ value: 'all', label: 'All Status' }, { value: 'not-started', label: 'Not Started' }, { value: 'in-progress', label: 'In Progress' }, { value: 'completed', label: 'Completed' }, { value: 'overdue', label: 'Overdue' }]} onChange={(v) => setFilterStatus(v)} className="w-40" />
        <SelectMenu value={filterCategory} options={[{ value: 'all', label: 'All Categories' }, { value: 'personal', label: 'Personal' }, { value: 'work', label: 'Work' }, { value: 'health', label: 'Health' }, { value: 'education', label: 'Education' }, { value: 'finance', label: 'Finance' }, { value: 'fitness', label: 'Fitness' }, { value: 'creative', label: 'Creative' }]} onChange={(v) => setFilterCategory(v)} className="w-40" />
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">{[1,2,3].map(i => <Card key={i}><div className="h-24 bg-gray-200 dark:bg-gray-700 rounded" /></Card>)}</div>
      ) : goals.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><FlagIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" /><p className="text-gray-400 mb-4">No goals yet. Set your first target!</p><Button onClick={() => { resetForm(); setEditingGoal(null); setModalOpen(true); }} icon={<PlusIcon className="w-4 h-4" />}>Create Goal</Button></CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal, idx) => (
            <motion.div key={goal._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: idx * 0.05 }}>
              <Card className="neon-card hover:shadow-glass-hover">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={STATUS_COLORS[goal.status]}>{goal.status.replace('-', ' ')}</Badge>
                        <Badge variant={PRIORITY_COLORS[goal.priority]}>{goal.priority}</Badge>
                      </div>
                      <h3 className="font-semibold text-gray-100 mb-1">{goal.title}</h3>
                      {goal.description && <p className="text-sm text-gray-400 mb-2">{goal.description}</p>}
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEditModal(goal)} className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-400 hover:bg-gray-700/50 transition-colors"><PencilIcon className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(goal._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-gray-700/50 transition-colors"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Progress</span>
                      <span>{goal.progress}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-gray-700 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500" style={{ width: `${goal.progress}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{goal.targetDate ? format(new Date(goal.targetDate), 'MMM d, yyyy') : 'No date'}</span>
                    <span className="ml-2">{goal.category}</span>
                  </div>
                  {goal.subtasks && goal.subtasks.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <p className="text-xs text-gray-400 mb-1">Subtasks: {goal.subtasks.filter(st => st.completed).length}/{goal.subtasks.length}</p>
                      <div className="flex flex-wrap gap-1">
                        {goal.subtasks.map((st, i) => (
                          <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${st.completed ? 'bg-green-500/15 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                            {st.title}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingGoal(null); resetForm(); }} title={editingGoal ? 'Edit Goal' : 'New Goal'} size="md">
        <form onSubmit={editingGoal ? handleUpdate : handleCreate} className="space-y-5">
          <Input label="Title" name="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} required placeholder="What's your goal?" />
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="input resize-none" placeholder="Add details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Date" name="targetDate" type="date" value={formData.targetDate} onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))} required />
            <SelectMenu value={formData.priority} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }, { value: 'urgent', label: 'Urgent' }]} onChange={(v) => setFormData(prev => ({ ...prev, priority: v }))} className="w-full" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectMenu value={formData.category} options={[{ value: 'personal', label: 'Personal' }, { value: 'work', label: 'Work' }, { value: 'health', label: 'Health' }, { value: 'education', label: 'Education' }, { value: 'finance', label: 'Finance' }, { value: 'fitness', label: 'Fitness' }, { value: 'creative', label: 'Creative' }]} onChange={(v) => setFormData(prev => ({ ...prev, category: v }))} className="w-full" />
            <Input label="Progress" name="progress" type="range" min="0" max="100" value={formData.progress} onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) }))} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditingGoal(null); resetForm(); }}>Cancel</Button>
            <Button type="submit">{editingGoal ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
