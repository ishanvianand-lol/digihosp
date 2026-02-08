import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Trash2, Clock, Plus, Pill, Check, Settings } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { supabase } from '../supabase/client';
import { WhatsAppSetup } from './WhatsAppSetup.tsx';

interface Reminder {
  id: string;
  medicine: string;
  time: string;
  created_at: string;
}

interface MedicineReminderProps {
  userId: string;
  userPhone?: string;
}

export function MedicineReminder({ userId, userPhone }: MedicineReminderProps) {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newMedicine, setNewMedicine] = useState('');
  const [newTime, setNewTime] = useState('');
  const [phone, setPhone] = useState(userPhone || '');
  const [loading, setLoading] = useState(false);
  const [showSetup, setShowSetup] = useState(!userPhone);
  const { toast } = useToast();

  useEffect(() => {
    if (phone) {
      loadReminders();
    }
  }, [userId, phone]);

  const loadReminders = async () => {
    try {
      const { data, error } = await (supabase
        .from('medicine_reminders' as any)
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('time', { ascending: true }) as any);

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  };

  const addReminder = async () => {
    if (!newMedicine || !newTime) {
      toast({
        variant: 'destructive',
        title: 'Missing Info',
        description: 'Please enter medicine name and time',
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await (supabase
        .from('medicine_reminders' as any)
        .insert({
          user_id: userId,
          medicine: newMedicine,
          time: newTime,
          phone_number: phone,
          is_active: true,
        })
        .select()
        .single() as any);

      if (error) throw error;

      // Send WhatsApp confirmation
      await fetch('/api/send-whatsapp-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          medicine: newMedicine,
          time: newTime,
        }),
      });

      setReminders([...reminders, data]);
      setNewMedicine('');
      setNewTime('');

      toast({
        title: '✅ Reminder Added',
        description: `Daily WhatsApp reminder set for ${newTime}`,
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteReminder = async (id: string) => {
    try {
      await (supabase
        .from('medicine_reminders' as any)
        .update({ is_active: false })
        .eq('id', id) as any);

      setReminders(reminders.filter((r) => r.id !== id));
      toast({ title: 'Reminder deleted' });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (showSetup) {
    return (
      <WhatsAppSetup
        userId={userId}
        onComplete={(phoneNumber) => {
          setPhone(phoneNumber);
          setShowSetup(false);
        }}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <Pill className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Medicine Reminders</h3>
            <p className="text-xs text-muted-foreground">Auto WhatsApp notifications</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSetup(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4">
        {/* Add New Reminder */}
        <div className="rounded-xl bg-muted/50 p-4 space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Medicine Name</label>
            <Input
              placeholder="e.g., Paracetamol"
              value={newMedicine}
              onChange={(e) => setNewMedicine(e.target.value)}
              className="h-11 bg-background border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Time</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="h-11 bg-background border-border pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">WhatsApp</label>
              <div className="flex h-11 items-center rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground">
                +91 {phone}
              </div>
            </div>
          </div>

          <Button
            onClick={addReminder}
            disabled={loading}
            className="w-full h-11 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Add Reminder
              </>
            )}
          </Button>
        </div>

        {/* Reminders List */}
        {reminders.length === 0 ? (
          <div className="rounded-xl bg-muted/30 p-8 text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-muted mb-3">
              <Pill className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No reminders yet</p>
            <p className="text-xs text-muted-foreground mt-1">Add your first medicine above</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 shrink-0">
                  <Pill className="h-5 w-5 text-green-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{reminder.medicine}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                    <Clock className="h-3 w-3" />
                    <span>{reminder.time}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Check className="h-3 w-3 text-green-600" />
                      Daily
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReminder(reminder.id)}
                  className="shrink-0 hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}