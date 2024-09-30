import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment-timezone';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { signOut, useSession } from 'next-auth/react';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const getTimezoneAbbreviation = (timezone) => {
  const abbreviation = moment().tz(timezone).format('z');
  return `${abbreviation} (${timezone})`;
};

const getCommonTimezones = () => {
  const commonZones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'America/Anchorage',
    'Pacific/Honolulu',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney'
  ];
  
  return moment.tz.names().filter(tz => 
    commonZones.includes(tz) || tz.startsWith('Etc/GMT')
  );
};

const SelectedSlotEvent = ({ event, onRemove }) => (
  <div style={{ 
    backgroundColor: 'rgba(0, 200, 0, 0.5)', 
    padding: '2px 5px', 
    borderRadius: '3px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100%'
  }}>
    <span>Available</span>
    <button 
      onClick={(e) => {
        e.stopPropagation();
        onRemove(event);
      }}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.2em',
        color: 'red'
      }}
    >
      ×
    </button>
  </div>
);


export default function CalendarView() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availableSlotsList, setAvailableSlotsList] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarTimezone, setCalendarTimezone] = useState(moment.tz.guess());
  const [availableSlotsTimezone, setAvailableSlotsTimezone] = useState(moment.tz.guess());




  const fetchEvents = useCallback(async (date) => {
    const startOfWeek = moment(date).startOf('week').toISOString();
    const endOfWeek = moment(date).endOf('week').toISOString();
    try {
      const response = await fetch(`/api/calendar-events?start=${startOfWeek}&end=${endOfWeek}`);
      if (response.ok) {
        const data = await response.json();
        return data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
        }));
      } else {
        console.error('Failed to fetch events');
        return [];
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }, []);

  useEffect(() => {
    fetchEvents(currentDate).then(setEvents);
  }, [currentDate, fetchEvents]);

  useEffect(() => {
    if (events.length > 0) {
      const eventTimezone = moment.tz.guess(events[0].start);
      setCalendarTimezone(eventTimezone);
    }
  }, [events]);

  

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = '/';
  };

  const handleSelectSlot = useCallback((slotInfo) => {
    const newSlot = {
      id: new Date().getTime(),
      title: 'Available',
      start: slotInfo.start,
      end: slotInfo.end,
      isSelectedSlot: true
    };
    setSelectedSlots(prev => [...prev, newSlot]);
  }, []);

  const handleEventResize = useCallback(({ event, start, end }) => {
    if (event.isSelectedSlot) {
      setSelectedSlots(prev => 
        prev.map(slot => 
          slot.id === event.id ? { ...slot, start, end } : slot
        )
      );
    }
  }, []);

  const handleEventDrop = useCallback(({ event, start, end }) => {
    if (event.isSelectedSlot) {
      setSelectedSlots(prev => 
        prev.map(slot => 
          slot.id === event.id ? { ...slot, start, end } : slot
        )
      );
    }
  }, []);

  const removeSelectedSlot = useCallback((slotToRemove) => {
    setSelectedSlots(prev => prev.filter(slot => slot.id !== slotToRemove.id));
  }, []);




  const generateAvailableSlotsList = useCallback(() => {
    const groupedSlots = selectedSlots.reduce((acc, slot) => {
      const day = moment(slot.start).tz(availableSlotsTimezone).format('MMMM D, YYYY');
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(slot);
      return acc;
    }, {});

    // Sort slots for each day
    Object.keys(groupedSlots).forEach(day => {
      groupedSlots[day].sort((a, b) => moment(a.start).diff(moment(b.start)));
    });

    // Sort days
    const sortedDays = Object.keys(groupedSlots).sort((a, b) => moment(a, 'MMMM D, YYYY').diff(moment(b, 'MMMM D, YYYY')));

    let formattedList = `Availability (${getTimezoneAbbreviation(availableSlotsTimezone)}):\n\n`;
    
    sortedDays.forEach(day => {
      formattedList += `${day}\n`;
      groupedSlots[day].forEach(slot => {
        formattedList += `• ${moment(slot.start).tz(availableSlotsTimezone).format('h:mm A')} - ${moment(slot.end).tz(availableSlotsTimezone).format('h:mm A')}\n`;
      });
      formattedList += '\n';
    });

    return formattedList.trim();
  }, [selectedSlots, availableSlotsTimezone]);

  useEffect(() => {
    setAvailableSlotsList(generateAvailableSlotsList());
  }, [selectedSlots, availableSlotsTimezone, generateAvailableSlotsList]);

  const handleAvailableSlotsTimezoneChange = (event) => {
    setAvailableSlotsTimezone(event.target.value);
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(availableSlotsList).then(() => {
      alert('Available time slots copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Calendar View</h1>
        <div className="user-info">
          {session?.user?.name && (
            <span>Signed in as: {session.user.email}</span>
          )}
          <button onClick={handleSignOut} className="sign-out-button">Sign Out</button>
        </div>
      </div>
      <div className="calendar-subheader">
        <p>Calendar events are shown in: {getTimezoneAbbreviation(calendarTimezone)}</p>
      </div>
      <div className="calendar-view">
      <DnDCalendar
          localizer={localizer}
          events={[...events, ...selectedSlots]}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          selectable
          resizable
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onNavigate={setCurrentDate}
          view="week"
          views={['week']}
          step={15}
          timeslots={4}
          components={{
            event: (props) => props.event.isSelectedSlot 
              ? <SelectedSlotEvent {...props} onRemove={removeSelectedSlot} />
              : <div className="event-item">{props.title}</div>
          }}
          eventPropGetter={(event) => ({
            className: event.isSelectedSlot ? 'selected-slot' : 'calendar-event',
            style: {
              cursor: event.isSelectedSlot ? 'move' : 'default',
            }
          })}
          draggableAccessor={(event) => event.isSelectedSlot}
          resizableAccessor={(event) => event.isSelectedSlot}
        />
      </div>
      <div className="action-section">
        <div className="timezone-selector">
          <label htmlFor="available-slots-timezone-select">Timezone for available slots: </label>
          <select
            id="available-slots-timezone-select"
            value={availableSlotsTimezone}
            onChange={handleAvailableSlotsTimezoneChange}
          >
            {getCommonTimezones().map((tz) => (
              <option key={tz} value={tz}>{getTimezoneAbbreviation(tz)}</option>
            ))}
          </select>
        </div>
        <div className="action-buttons">
          <button onClick={handleCopyToClipboard}>Copy Available Slots</button>
        </div>
      </div>
      {availableSlotsList && (
        <div className="preview-container">
          <h3>Available Slots:</h3>
          <pre>{availableSlotsList}</pre>
        </div>
      )}
      <style jsx>{`
  .calendar-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: Arial, sans-serif;
  }
  .calendar-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  .calendar-subheader {
    margin-bottom: 20px;
    font-style: italic;
    color: #666;
  }
  .user-info {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .sign-out-button {
    padding: 5px 10px;
    background-color: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .sign-out-button:hover {
    background-color: #d32f2f;
  }
  .calendar-view {
    height: 600px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .action-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  .timezone-selector {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .timezone-selector select {
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #ccc;
  }
  .action-buttons {
    display: flex;
    gap: 10px;
  }
  .action-buttons button {
    padding: 10px 20px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  .action-buttons button:hover {
    background-color: #45a049;
  }
  .preview-container {
    margin-top: 20px;
    padding: 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: #f9f9f9;
  }
  .preview-container pre {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  
  :global(.calendar-event) {
    background-color: #3174ad;
    color: white;
    border-radius: 3px;
    padding: 2px 5px;
  }
  :global(.rbc-calendar) {
    background-color: white;
  }
  :global(.rbc-header) {
    background-color: #f0f0f0;
    padding: 10px;
  }
  :global(.rbc-timeslot-group) {
    border-bottom: 1px solid #e0e0e0;
  }
  :global(.rbc-time-view) {
    border: none;
  }
  :global(.rbc-time-header-content) {
    border-left: none;

 

  :global(.selected-slot) {
    background-color: rgba(0, 200, 0, 0.5) !important;
    cursor: move;
  }
  :global(.rbc-event-content) {
    height: 100%;
  }
  :global(.rbc-addons-dnd-resize-ns-icon) {
    width: 10px;
    height: 10px;
    background-color: #000;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

`}</style>
    </div>
  );
}
