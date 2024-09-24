import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment-timezone';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = momentLocalizer(moment);

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

export default function CalendarView() {
  const [events, setEvents] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [preview, setPreview] = useState('');
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

  const handleNavigate = (newDate) => {
    setCurrentDate(newDate);
  };

  const handleSelectSlot = (slotInfo) => {
    const newSlot = {
      id: new Date().getTime(),
      title: 'Available',
      start: slotInfo.start,
      end: slotInfo.end,
      isSelectedSlot: true
    };
    setSelectedSlots(prev => [...prev, newSlot]);
  };

  const removeSelectedSlot = (slotToRemove) => {
    setSelectedSlots(prev => prev.filter(slot => slot.id !== slotToRemove.id));
  };

  const generateShareableList = () => {
    const groupedSlots = selectedSlots.reduce((acc, slot) => {
      const day = moment(slot.start).tz(availableSlotsTimezone).format('MMMM D, YYYY');
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(slot);
      return acc;
    }, {});

    let formattedList = `Available slots (${getTimezoneAbbreviation(availableSlotsTimezone)}):\n\n`;
    for (const [day, slots] of Object.entries(groupedSlots)) {
      formattedList += `${day}\n`;
      slots.forEach(slot => {
        formattedList += `• ${moment(slot.start).tz(availableSlotsTimezone).format('h:mm A')} - ${moment(slot.end).tz(availableSlotsTimezone).format('h:mm A')}\n`;
      });
      formattedList += '\n';
    }

    return formattedList.trim();
  };

  const handlePreview = () => {
    setPreview(generateShareableList());
  };

  const handleCopyToClipboard = () => {
    const list = generateShareableList();
    navigator.clipboard.writeText(list).then(() => {
      alert('Available time slots copied to clipboard!');
    }, (err) => {
      console.error('Could not copy text: ', err);
    });
  };

  const handleAvailableSlotsTimezoneChange = (event) => {
    setAvailableSlotsTimezone(event.target.value);
  };

  const allEvents = [...events, ...selectedSlots];

  return (
    <div>
      <div style={{ marginBottom: '10px' }}>
        <p>Calendar events are shown in: {getTimezoneAbbreviation(calendarTimezone)}</p>
        <label htmlFor="available-slots-timezone-select">Available Slots Timezone: </label>
        <select
          id="available-slots-timezone-select"
          value={availableSlotsTimezone}
          onChange={handleAvailableSlotsTimezoneChange}
          style={{ padding: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
        >
          {getCommonTimezones().map((tz) => (
            <option key={tz} value={tz}>{getTimezoneAbbreviation(tz)}</option>
          ))}
        </select>
      </div>
      <div style={{ height: '500px' }}>
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          selectable
          onSelectSlot={handleSelectSlot}
          onNavigate={handleNavigate}
          view="week"
          views={['week']}
          components={{
            event: (props) => props.event.isSelectedSlot 
              ? <SelectedSlotEvent {...props} onRemove={removeSelectedSlot} />
              : <div>{props.title}</div>
          }}
          eventPropGetter={(event) => ({
            style: {
              backgroundColor: event.isSelectedSlot ? 'rgba(0, 200, 0, 0.5)' : '#3174ad'
            }
          })}
        />
      </div>
      <button onClick={handlePreview}>Preview Available Slots</button>
      <button onClick={handleCopyToClipboard}>Copy Available Slots</button>
      {preview && (
        <div style={{ 
          marginTop: '20px', 
          padding: '10px', 
          border: '1px solid #ccc', 
          borderRadius: '5px',
          whiteSpace: 'pre-wrap'
        }}>
          <h3>Preview:</h3>
          {preview}
        </div>
      )}
    </div>
  );
}

const SelectedSlotEvent = ({ event, onRemove }) => (
  <div style={{ 
    backgroundColor: 'rgba(0, 200, 0, 0.5)', 
    padding: '2px 5px', 
    borderRadius: '3px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
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