'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Bell, MessageSquare, Mail } from 'lucide-react';
import { getQueueState, getPatientPosition } from '@/lib/queueManager';

export default function NotificationSystem() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Simulate notification sending when patient position changes
  const sendNotification = (type: 'sms' | 'whatsapp' | 'app', message: string) => {
    console.log(`📱 ${type.toUpperCase()} Notification:`, message);
    
    // In production, this would call actual SMS/WhatsApp APIs
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Hospital Queue Update', {
          body: message,
          icon: '/hospital-icon.png',
        });
      }
    }
  };

  useEffect(() => {
    if (!notificationsEnabled) return;

    const interval = setInterval(() => {
      const state = getQueueState();
      
      state.patients.forEach((patient) => {
        if (patient.status === 'waiting') {
          const position = getPatientPosition(patient.id);
          
          // Notify when patient is within 3 positions
          if (position <= 3 && position > 0) {
            const message = `Hi ${patient.name}, your turn is approaching! You are position ${position} in the queue. Token: ${patient.tokenNumber}`;
            sendNotification('app', message);
          }
          
          // Notify when patient is next
          if (position === 1) {
            const message = `Hi ${patient.name}, you're next! Please be ready. Token: ${patient.tokenNumber}`;
            sendNotification('sms', message);
            sendNotification('whatsapp', message);
          }
        }
        
        // Notify when called
        if (patient.status === 'in-consultation' && patient.calledAt) {
          const timeDiff = Date.now() - new Date(patient.calledAt).getTime();
          if (timeDiff < 5000) { // Within 5 seconds of being called
            const message = `Hi ${patient.name}, please proceed to the consultation room now! Token: ${patient.tokenNumber}`;
            sendNotification('app', message);
          }
        }
      });
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [notificationsEnabled]);

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification System
        </CardTitle>
        <CardDescription>
          Receive alerts via SMS, WhatsApp, or app notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number for Alerts</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+91 XXXXX XXXXX"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            SMS Alerts
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            WhatsApp Alerts
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Bell className="h-3 w-3" />
            App Notifications
          </Badge>
        </div>

        <Button
          onClick={enableNotifications}
          disabled={notificationsEnabled}
          className="w-full"
        >
          {notificationsEnabled ? 'Notifications Enabled ✓' : 'Enable Notifications'}
        </Button>

        {notificationsEnabled && (
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-center">
              ✓ You will receive notifications when your turn approaches
            </p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• SMS/WhatsApp alerts sent when you're next in line</p>
          <p>• App notifications when your turn is within 3 patients</p>
          <p>• Real-time updates on your queue position</p>
        </div>
      </CardContent>
    </Card>
  );
}