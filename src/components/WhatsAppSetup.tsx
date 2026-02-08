import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { MessageCircle, Check } from 'lucide-react';
import { supabase } from '../supabase/client';
import { useToast } from '../hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';

interface WhatsAppSetupProps {
  userId: string;
  onComplete: (phone: string) => void;
}

export function WhatsAppSetup({ userId, onComplete }: WhatsAppSetupProps) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const savePhone = async () => {
    if (phone.length !== 10) {
      toast({
        variant: 'destructive',
        title: 'Invalid Number',
        description: 'Please enter 10-digit number',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ whatsapp_number: phone })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: '✅ WhatsApp Connected!',
        description: 'You can now receive medicine reminders',
      });

      onComplete(phone);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save number',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-600" />
            Connect WhatsApp
          </DialogTitle>
          <DialogDescription>
            Enable automatic medicine reminders on WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-xl bg-green-50 border border-green-200 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-green-900 mb-1">One-time Setup</p>
                <p className="text-sm text-green-700">
                  Save your WhatsApp number once, get automatic reminders forever!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">WhatsApp Number</Label>
            <div className="flex gap-2">
              <div className="flex h-12 items-center rounded-lg border-2 border-border bg-muted px-3 text-muted-foreground">
                +91
              </div>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                className="h-12 flex-1 border-2"
                maxLength={10}
              />
            </div>
          </div>

          <Button
            onClick={savePhone}
            disabled={loading || phone.length !== 10}
            className="w-full h-12 bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                <MessageCircle className="h-5 w-5 mr-2" />
                Connect WhatsApp
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            We'll send reminders to this number only. No spam, ever.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}