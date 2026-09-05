import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventApi } from '../services/api';
import { Card, CardHeader, CardTitle, CardContent, Button, Modal, Input, CategoryBadge, DropdownMenu, SelectMenu } from '../components/ui';
import { PlusIcon, ChevronLeftIcon, ChevronRightIcon, XMarkIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isToday, parseISO } from 'date-fns';
import toast from 'react-hot-toast';

export function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endDate: format(new Date(), 'yyyy-MM-dd'),
    endTime: '10:00',
    allDay: false,
    category: 'personal',
    color: '#6366f1',
    location: '',
    reminder: true,
    reminderTime: 15,
    recurring: 'none',
  });

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const res = await eventApi.getForMonth(year, month);
      setEvents(res.data.events);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      resetForm();
      setModalOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    const days = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach(event => {
      const start = parseISO(event.startDate);
      const end = parseISO(event.endDate);
      let day = start;
      while (day <= end) {
        const key = format(day, 'yyyy-MM-dd');
        if (!map[key]) map[key] = [];
        map[key].push(event);
        day = addDays(day, 1);
      }
    });
    return map;
  }, [events]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await eventApi.create(formData);
      setEvents([...events, res.data.event]);
      setModalOpen(false);
      resetForm();
      toast.success('Event created');
    } catch (error) {
      toast.error('Failed to create event');
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const res = await eventApi.update(editingEvent._id, formData);
      setEvents(prev => prev.map(e => e._id === editingEvent._id ? res.data.event : e));
      setModalOpen(false);
      setEditingEvent(null);
      resetForm();
      toast.success('Event updated');
    } catch (error) {
      toast.error('Failed to update event');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await eventApi.delete(id);
      setEvents(prev => prev.filter(e => e._id !== id));
      toast.success('Event deleted');
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const openEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      startDate: format(parseISO(event.startDate), 'yyyy-MM-dd'),
      startTime: event.startTime,
      endDate: format(parseISO(event.endDate), 'yyyy-MM-dd'),
      endTime: event.endTime,
      allDay: event.allDay,
      category: event.category,
      color: event.color,
      location: event.location || '',
      reminder: event.reminder,
      reminderTime: event.reminderTime,
      recurring: event.recurring,
    });
    setModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      startTime: '09:00',
      endDate: format(new Date(), 'yyyy-MM-dd'),
      endTime: '10:00',
      allDay: false,
      category: 'personal',
      color: '#6366f1',
      location: '',
      reminder: true,
      reminderTime: 15,
      recurring: 'none',
    });
  };

  const dayEvents = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    return eventsByDay[key] || [];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Calendar</h1>
          <p className="text-gray-600 dark:text-gray-400">Schedule and manage your events</p>
        </div>
        <Button onClick={() => { resetForm(); setModalOpen(true); }} icon={<PlusIcon className="w-5 h-5" />}>
          New Event
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addDays(currentMonth, -30))} aria-label="Previous month">
              <ChevronLeftIcon className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50 min-w-[180px] text-center">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(addDays(currentMonth, 30))} aria-label="Next month">
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setCurrentMonth(new Date())} className="ml-auto">
              Today
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-0.5">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={i} className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}
            {loading ? (
              [...Array(42)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-lg m-0.5" />
              ))
            ) : (
              daysInMonth.map((day) => {
                const dayEventsList = dayEvents(day);
                const today = isToday(day);
                const currentMonthDay = isSameMonth(day, currentMonth);
                
                return (
                  <div
                    key={format(day, 'yyyy-MM-dd')}
                    className={`
                      relative min-h-[100px] p-2 rounded-lg transition-colors
                      ${currentMonthDay ? 'bg-white/50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50' : 'bg-gray-50/50 dark:bg-gray-900/50'}
                      ${today ? 'ring-2 ring-indigo-500' : ''}
                    `}
                    onClick={() => { setSelectedDate(day); resetForm(); setFormData(prev => ({ ...prev, startDate: format(day, 'yyyy-MM-dd'), endDate: format(day, 'yyyy-MM-dd') })); setModalOpen(true); }}
                  >
                    <span className={`
                      text-sm font-medium
                      ${today ? 'text-indigo-600 dark:text-indigo-400' : currentMonthDay ? 'text-gray-900 dark:text-gray-50' : 'text-gray-400 dark:text-gray-600'}
                    `}>
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 space-y-1 max-h-[70px] overflow-hidden">
                      {dayEventsList.slice(0, 3).map((event) => (
                        <div
                          key={event._id}
                          className="text-xs px-1.5 py-0.5 rounded truncate cursor-pointer hover:opacity-80"
                          style={{ backgroundColor: event.color + '33', borderLeft: `3px solid ${event.color}` }}
                          onClick={(e) => { e.stopPropagation(); openEditModal(event); }}
                        >
                          {event.allDay ? '' : `${format(parseISO(event.startDate), 'HH:mm')} `}{event.title}
                        </div>
                      ))}
                      {dayEventsList.length > 3 && (
                        <div className="text-xs text-gray-400 dark:text-gray-500 text-center">
                          +{dayEventsList.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {selectedDate && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(null)}>
              <XMarkIcon className="w-5 h-5" />
            </Button>
          </CardHeader>
          <CardContent>
            {dayEvents(selectedDate).length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No events on this day</p>
            ) : (
              <div className="space-y-2">
                {dayEvents(selectedDate).map((event) => (
                  <div key={event._id} className="flex items-center gap-3 p-3 glass-panel rounded-xl border-l-4" style={{ borderColor: event.color }}>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-50">{event.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {event.allDay ? 'All day' : `${event.startTime} - ${event.endTime}`}
                        <CategoryBadge category={event.category} />
                      </div>
                      {event.location && <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{event.location}</p>}
                    </div>
                    <DropdownMenu
                      trigger={
                        <button className="p-1 rounded text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
                      }
                      items={[
                        { key: 'edit', label: 'Edit', icon: PencilIcon, onClick: () => openEditModal(event) },
                        { key: 'delete', label: 'Delete', icon: TrashIcon, onClick: () => handleDelete(event._id), danger: true },
                      ]}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditingEvent(null); resetForm(); setSelectedDate(null); }} title={editingEvent ? 'Edit Event' : 'New Event'} size="lg">
        <form onSubmit={editingEvent ? handleEdit : handleCreate} className="space-y-5">
          <Input label="Title" name="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} required placeholder="Event title" />
          
          <div>
            <label className="label">Description</label>
            <textarea name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} rows={2} className="input resize-none" placeholder="Event details..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" name="startDate" type="date" value={formData.startDate} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} required />
            <Input label="Start Time" name="startTime" type="time" value={formData.startTime} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="End Date" name="endDate" type="date" value={formData.endDate} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} required />
            <Input label="End Time" name="endTime" type="time" value={formData.endTime} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Category</label>
              <SelectMenu value={formData.category} options={[
                { value: 'personal', label: 'Personal' }, { value: 'work', label: 'Work' },
                { value: 'meeting', label: 'Meeting' }, { value: 'appointment', label: 'Appointment' },
                { value: 'reminder', label: 'Reminder' }, { value: 'birthday', label: 'Birthday' },
                { value: 'holiday', label: 'Holiday' }, { value: 'other', label: 'Other' },
              ]} onChange={(v) => setFormData(prev => ({ ...prev, category: v }))} className="w-full" />
            </div>
            <div>
              <label className="label">Color</label>
              <input type="color" value={formData.color} onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))} className="w-full h-10 rounded-xl border border-gray-200 dark:border-gray-700 cursor-pointer" />
            </div>
          </div>

          <Input label="Location" name="location" value={formData.location} onChange={(e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))} placeholder="Meeting location (optional)" />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input type="checkbox" checked={formData.allDay} onChange={(e) => setFormData(prev => ({ ...prev, allDay: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">All day</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer flex-1">
              <input type="checkbox" checked={formData.reminder} onChange={(e) => setFormData(prev => ({ ...prev, reminder: e.target.checked }))} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Reminder</span>
            </label>
          </div>

          {formData.reminder && (
            <SelectMenu value={formData.reminderTime} options={[
              { value: 0, label: 'At time' }, { value: 5, label: '5 min before' },
              { value: 15, label: '15 min before' }, { value: 30, label: '30 min before' },
              { value: 60, label: '1 hour before' }, { value: 1440, label: '1 day before' },
            ]} onChange={(v) => setFormData(prev => ({ ...prev, reminderTime: v }))} className="w-48" />
          )}

          <div>
            <label className="label">Recurring</label>
            <SelectMenu value={formData.recurring} options={[
              { value: 'none', label: 'Does not repeat' },
              { value: 'daily', label: 'Daily' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly' },
            ]} onChange={(v) => setFormData(prev => ({ ...prev, recurring: v }))} className="w-full" />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditingEvent(null); resetForm(); }}>Cancel</Button>
            <Button type="submit">{editingEvent ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}