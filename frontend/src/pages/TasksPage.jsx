import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { taskApi } from '../services/api';
import {
  Card, Button, Input, Badge,
  PriorityBadge, CategoryBadge, Modal, DropdownMenu, SelectMenu
} from '../components/ui';
import {
  PlusIcon, MagnifyingGlassIcon, ArrowsUpDownIcon,
  PencilIcon, TrashIcon, CheckIcon
} from '@heroicons/react/24/outline';
import { format, isPast } from 'date-fns';
import toast from 'react-hot-toast';
import { playSound } from '../utils/sound';

function SortableTaskItem({ task, onUpdate, onDelete, onEdit }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const dueDate = task.dueDate ? new Date(task.dueDate) : null;
  const isOverdue = dueDate && isPast(dueDate) && !task.completed;

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div {...attributes} {...listeners} className="flex items-center gap-3 p-4 glass-panel rounded-xl cursor-grab active:cursor-grabbing hover:shadow-glass-hover transition-all">
        <div className="flex items-center justify-center w-8 h-8 text-gray-400 hover:text-indigo-500">
          <ArrowsUpDownIcon className="w-5 h-5" />
        </div>
        
        <button
          onClick={() => onUpdate(task._id, { completed: !task.completed })}
          className={`
            flex-shrink-0 w-5 h-5 rounded border-2 transition-all
            ${task.completed 
              ? 'bg-green-500 border-green-500 text-white' 
              : 'border-gray-300 dark:border-gray-600 hover:border-indigo-500'
            }
          `}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <CheckIcon className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-50'} font-medium truncate`}>
            {task.title}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <PriorityBadge priority={task.priority} />
            <CategoryBadge category={task.category} />
            {task.dueDate && (
              <Badge variant={isOverdue ? 'danger' : 'default'} dot>
                {format(dueDate, 'MMM d')}
              </Badge>
            )}
            {task.reminder && (
              <Badge variant="info" dot>
                Reminder
              </Badge>
            )}
          </div>
        </div>

        <DropdownMenu
          trigger={
            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
            </button>
          }
          items={[
            { key: 'edit', label: 'Edit', icon: PencilIcon, onClick: () => onEdit(task) },
            { key: 'delete', label: 'Delete', icon: TrashIcon, onClick: () => onDelete(task._id), danger: true },
          ]}
        />
      </div>
    </div>
  );
}

export function TasksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: 'all', category: 'all', priority: 'all', sort: 'order' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', priority: 'medium', category: 'personal', dueDate: '', dueTime: '', reminder: false, reminderTime: 15 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      if (params.status === 'all') delete params.completed;
      else params.completed = params.status === 'completed';
      delete params.status;
      
      Object.keys(params).forEach(key => !params[key] && delete params[key]);
      
      const res = await taskApi.getAll(params);
      setTasks(res.data.tasks);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setEditingTask(null);
      resetForm();
      setModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(t => t._id === active.id);
      const newIndex = tasks.findIndex(t => t._id === over.id);
      const newTasks = Array.from(tasks);
      const [removed] = newTasks.splice(oldIndex, 1);
      newTasks.splice(newIndex, 0, removed);
      setTasks(newTasks);
      try {
        await taskApi.reorder(newTasks.map((t, i) => ({ id: t._id, order: i })));
      } catch (error) {
        toast.error('Failed to reorder tasks');
        fetchTasks();
      }
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await taskApi.create(formData);
      setTasks([res.data.task, ...tasks]);
      setModalOpen(false);
      resetForm();
      toast.success('Task created');
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await taskApi.update(id, data);
      if (data.completed === true) {
        playSound.taskComplete();
      }
      setTasks(prev => prev.map(t => t._id === id ? res.data.task : t));
    } catch (error) {
      toast.error('Failed to update task');
      fetchTasks();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    try {
      await taskApi.delete(id);
      setTasks(prev => prev.filter(t => t._id !== id));
      toast.success('Task deleted');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      category: task.category,
      dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
      dueTime: task.dueTime || '',
      reminder: task.reminder,
      reminderTime: task.reminderTime,
    });
    setModalOpen(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await taskApi.update(editingTask._id, formData);
      setTasks(prev => prev.map(t => t._id === editingTask._id ? res.data.task : t));
      setModalOpen(false);
      setEditingTask(null);
      resetForm();
      toast.success('Task updated');
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', priority: 'medium', category: 'personal', dueDate: '', dueTime: '', reminder: false, reminderTime: 15 });
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredTasks = tasks.filter(task => {
    if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.description?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Tasks</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your to-do list</p>
        </div>
        <Button onClick={() => { setEditingTask(null); resetForm(); setModalOpen(true); }} icon={<PlusIcon className="w-5 h-5" />}>
          New Task
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <SelectMenu
            value={filters.status}
            options={[
              { value: 'all', label: 'All' },
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
            ]}
            onChange={(v) => handleFilterChange('status', v)}
            placeholder="Status"
            className="w-36"
          />
          <SelectMenu
            value={filters.category}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'personal', label: 'Personal' },
              { value: 'work', label: 'Work' },
              { value: 'shopping', label: 'Shopping' },
              { value: 'health', label: 'Health' },
              { value: 'education', label: 'Education' },
              { value: 'finance', label: 'Finance' },
              { value: 'other', label: 'Other' },
            ]}
            onChange={(v) => handleFilterChange('category', v)}
            placeholder="Category"
            className="w-40"
          />
          <SelectMenu
            value={filters.priority}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'urgent', label: 'Urgent' },
              { value: 'high', label: 'High' },
              { value: 'medium', label: 'Medium' },
              { value: 'low', label: 'Low' },
            ]}
            onChange={(v) => handleFilterChange('priority', v)}
            placeholder="Priority"
            className="w-40"
          />
          <SelectMenu
            value={filters.sort}
            options={[
              { value: 'order', label: 'Manual' },
              { value: 'dueDate', label: 'Due Date' },
              { value: 'priority', label: 'Priority' },
              { value: 'createdAt', label: 'Created' },
            ]}
            onChange={(v) => handleFilterChange('sort', v)}
            placeholder="Sort"
            className="w-36"
          />
        </div>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredTasks.map(t => t._id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {loading ? (
              [...Array(5)].map((_, i) => (
                <Card key={i}><div className="h-12 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"/></Card>
              ))
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
                <p className="text-gray-500 dark:text-gray-400">No tasks found</p>
                <Button onClick={() => { resetForm(); setModalOpen(true); }} className="mt-4" icon={<PlusIcon className="w-4 h-4" />}>
                  Create your first task
                </Button>
              </div>
            ) : (
              filteredTasks.map((task, _index) => (
                <SortableTaskItem key={task._id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} onEdit={openEditModal} />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingTask(null); resetForm(); }} title={editingTask ? 'Edit Task' : 'New Task'} size="lg">
        <form onSubmit={editingTask ? handleEdit : handleCreate} className="space-y-5">
          <Input label="Title" name="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} required placeholder="What needs to be done?" />
          
          <div>
            <label className="label">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))}
              rows={3}
              className="input resize-none"
              placeholder="Add details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Priority</label>
              <SelectMenu
                value={formData.priority}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'urgent', label: 'Urgent' },
                ]}
                onChange={(v) => setFormData(prev => ({ ...prev, priority: v }))}
                className="w-full"
              />
            </div>
            <div>
              <label className="label">Category</label>
              <SelectMenu
                value={formData.category}
                options={[
                  { value: 'personal', label: 'Personal' },
                  { value: 'work', label: 'Work' },
                  { value: 'shopping', label: 'Shopping' },
                  { value: 'health', label: 'Health' },
                  { value: 'education', label: 'Education' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'other', label: 'Other' },
                ]}
                onChange={(v) => setFormData(prev => ({ ...prev, category: v }))}
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Due Date" name="dueDate" type="date" value={formData.dueDate} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} />
            <Input label="Due Time" name="dueTime" type="time" value={formData.dueTime} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input
                type="checkbox"
                checked={formData.reminder}
                onChange={(e) => setFormData(prev => ({ ...prev, reminder: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Set reminder</span>
            </label>
            {formData.reminder && (
              <SelectMenu
                value={formData.reminderTime}
                options={[
                  { value: 0, label: 'At time' },
                  { value: 5, label: '5 min before' },
                  { value: 15, label: '15 min before' },
                  { value: 30, label: '30 min before' },
                  { value: 60, label: '1 hour before' },
                  { value: 1440, label: '1 day before' },
                ]}
                onChange={(v) => setFormData(prev => ({ ...prev, reminderTime: v }))}
                className="w-40"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditingTask(null); resetForm(); }}>Cancel</Button>
            <Button type="submit" loading={loading}>{editingTask ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}