# Hospital Queue Management System

## Overview
A complete real-time queue management solution for Indian hospitals that helps patients track their position and receive notifications while enabling staff to efficiently manage multiple departments.

## Features Implemented

### For Patients (Patient Portal)
- **Token Generation**: Automatic token assignment upon registration
- **Real-Time Position Tracking**: Live updates on queue position
- **Estimated Wait Time**: Smart calculation based on department counters and average wait times
- **Department Selection**: Choose from General Medicine, Cardiology, Orthopedics, Pediatrics, and Laboratory
- **Visual Progress Indicator**: Clear progress bar showing how close your turn is
- **Status Notifications**: Alerts when turn is approaching (within 3 positions)
- **Multi-channel Notifications**: SMS, WhatsApp, and in-app alerts

### For Admin/Doctors (Admin Dashboard)
- **Department Management**: Switch between multiple departments
- **Queue Overview**: Real-time stats for waiting, in-consultation, and completed patients
- **Call Next Patient**: One-click button to call the next patient with automatic notification
- **Patient Tables**: Organized tabs for different patient statuses
- **Consultation Management**: Mark patients as complete when consultation ends
- **Wait Time Analytics**: Track average wait times per department
- **Live Updates**: Dashboard auto-refreshes every 2 seconds

### Technical Features
- **Local Storage**: Queue state persists across browser sessions
- **Real-time Updates**: Patient dashboard refreshes every 3 seconds
- **Token Format**: Department prefix + sequential number (e.g., G001, C002)
- **Time Tracking**: Monitors join time, call time, and completion time
- **Multi-counter Support**: Calculates wait times based on available counters per department

## How to Use

### As a Patient:
1. Go to homepage and click "Enter as Patient"
2. Fill in your name, phone number, and select department
3. Click "Get Token" to receive your token number
4. View your real-time position and estimated wait time
5. Enable notifications to receive alerts when your turn approaches
6. Proceed to consultation room when called

### As an Admin/Doctor:
1. Go to homepage and click "Enter as Admin/Doctor"
2. Select the department you want to manage
3. View real-time statistics and waiting patients
4. Click "Call Next Patient" to call the next person in queue
5. Mark patients as complete when consultation finishes
6. Monitor analytics across different status tabs

## Default Departments

| Department | Counters | Avg Wait Time |
|------------|----------|---------------|
| General Medicine | 3 | 15 mins |
| Cardiology | 2 | 20 mins |
| Orthopedics | 2 | 18 mins |
| Pediatrics | 2 | 12 mins |
| Laboratory | 4 | 10 mins |

## Notification System
The system includes a comprehensive notification feature:
- **Position-based alerts**: Notified when within 3 positions of your turn
- **Immediate call alert**: SMS/WhatsApp when you're next
- **Browser notifications**: In-app alerts for real-time updates
- **Multi-channel support**: SMS, WhatsApp, and app notifications

## Technical Stack
- **Frontend**: Next.js 15, React, TypeScript
- **UI Components**: Shadcn/UI, Tailwind CSS
- **State Management**: Local Storage
- **Real-time Updates**: Polling with setInterval
- **Icons**: Lucide React

## File Structure
```
src/
├── types/queue.ts                    # TypeScript interfaces
├── lib/queueManager.ts               # Core queue logic and storage
├── components/
│   ├── TokenRegistration.tsx         # Patient registration form
│   ├── PatientStatus.tsx             # Patient queue status display
│   ├── AdminDashboard.tsx            # Admin queue management
│   └── NotificationSystem.tsx        # Notification handler
└── app/
    ├── page.tsx                      # Homepage with role selection
    ├── patient/page.tsx              # Patient portal
    └── admin/page.tsx                # Admin/doctor dashboard
```

## Future Enhancements (Optional)
- Integration with actual SMS/WhatsApp APIs (Twilio, WhatsApp Business API)
- Database backend for multi-device synchronization
- Patient feedback system after consultation
- Peak hours analytics and reporting
- Load balancing between counters
- QR code-based token scanning
- Multi-language support (Hindi, Tamil, etc.)
- Voice announcements for token calls
- Integration with hospital management systems

## Production Considerations
For production deployment:
1. Replace local storage with a proper database (PostgreSQL, MongoDB)
2. Implement WebSocket connections for true real-time updates
3. Add authentication for admin/doctor access
4. Integrate real SMS/WhatsApp APIs
5. Add data backup and recovery systems
6. Implement proper error handling and logging
7. Add rate limiting and security measures
8. Deploy with proper scaling infrastructure

## Demo Data
The system starts with empty queues. Register patients through the patient portal to see the system in action. The queue state persists in browser local storage.

---

**Built for the Hospital Queue Management Hackathon Challenge**
*Addressing real problems in Indian healthcare with technology*