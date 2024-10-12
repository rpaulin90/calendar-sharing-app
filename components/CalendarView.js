import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment-timezone';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { signOut, useSession } from 'next-auth/react';
import AsyncSelect from 'react-select/async';
import debounce from 'lodash/debounce';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const getTimezoneAbbreviation = (timezone) => {
  const abbreviation = moment().tz(timezone).format('z');
  return `${abbreviation} (${timezone})`;
};

const getCommonTimezones = () => {
  const commonZones = [
    'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
    'America/Anchorage', 'Pacific/Honolulu', 'Europe/London', 'Europe/Paris',
    'Asia/Tokyo', 'Australia/Sydney'
  ];
  
  return moment.tz.names().filter(tz => 
    commonZones.includes(tz) || tz.startsWith('Etc/GMT')
  );
};

const getColorForEmail = (email) => {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = email.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = `hsl(${hash % 360}, 70%, 70%)`;
  return color;
};



export default function CalendarView() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);
  const [selectedSlots, setSelectedSlots] = useState([]);
  const [availableSlotsList, setAvailableSlotsList] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarTimezone, setCalendarTimezone] = useState(moment.tz.guess());
  const [availableSlotsTimezone, setAvailableSlotsTimezone] = useState(moment.tz.guess());
  const [modalEvent, setModalEvent] = useState(null);
  const [selectedPeople, setSelectedPeople] = useState([]);
  const [userColors, setUserColors] = useState({});

  const formats = useMemo(() => ({
    eventTimeRangeFormat: () => { 
      return "";
    },
  }), []);

  const fetchEvents = useCallback(async (start, end, emails) => {
    const startISO = moment(start).toISOString();
    const endISO = moment(end).toISOString();
    const emailsString = emails.join(',');
    
    try {
      const response = await fetch(`/api/multi-calendar-events?start=${startISO}&end=${endISO}&emails=${emailsString}`);
      if (response.ok) {
        const data = await response.json();
        return data.map(event => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end),
          isExternal: true,
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
    if (session?.user?.email) {
      const emails = [session.user.email, ...selectedPeople.map(person => person.value)];
      const start = moment(currentDate).startOf('week').toDate();
      const end = moment(currentDate).endOf('week').toDate();
      fetchEvents(start, end, emails).then(fetchedEvents => {
        setEvents(prevEvents => {
          const availabilitySlots = prevEvents.filter(event => !event.isExternal);
          return [...availabilitySlots, ...fetchedEvents];
        });
      });
    }
  }, [selectedPeople, currentDate, fetchEvents, session]);

  const handleSelectSlot = useCallback((slotInfo) => {
    const newSlot = {
      id: new Date().getTime(),
      title: 'Available',
      start: slotInfo.start,
      end: slotInfo.end,
      isAvailability: true
    };
    setEvents(prev => [...prev, newSlot]);
    setSelectedSlots(prev => [...prev, newSlot]);
  }, []);

  const handleEventResize = useCallback(({ event, start, end }) => {
    if (event.isAvailability) {
      setEvents(prev => prev.map(evt => 
        evt.id === event.id ? { ...evt, start, end } : evt
      ));
      setSelectedSlots(prev => prev.map(slot => 
        slot.id === event.id ? { ...slot, start, end } : slot
      ));
    }
  }, []);

  const handleEventDrop = useCallback(({ event, start, end }) => {
    if (event.isAvailability) {
      setEvents(prev => prev.map(evt => 
        evt.id === event.id ? { ...evt, start, end } : evt
      ));
      setSelectedSlots(prev => prev.map(slot => 
        slot.id === event.id ? { ...slot, start, end } : slot
      ));
    }
  }, []);

  const handleEventClick = useCallback((event) => {
    if (event.isAvailability) {
      setModalEvent(event);
    }
  }, []);

  const closeModal = useCallback(() => {
    setModalEvent(null);
  }, []);

  const removeSelectedSlot = useCallback((slotToRemove) => {
    setEvents(prev => prev.filter(event => event.id !== slotToRemove.id));
    setSelectedSlots(prev => prev.filter(slot => slot.id !== slotToRemove.id));
    closeModal();
  }, [closeModal]);

  const getColorForUser = useCallback((email) => {
    if (userColors[email]) {
      return userColors[email];
    }
    const newColor = `hsl(${Object.keys(userColors).length * 137.508}, 70%, 60%)`;
    setUserColors(prevColors => ({ ...prevColors, [email]: newColor }));
    return newColor;
  }, [userColors]);

  const eventStyleGetter = useCallback((event) => {
    if (event.isAvailability) {
      return {
        style: {
          backgroundColor: 'green',
          opacity: 0.8,
          color: 'white',
          border: 'none'
        }
      };
    } else {
      const color = getColorForUser(event.email);
      return {
        style: {
          backgroundColor: color,
          opacity: 0.7,
          color: 'white',
          border: 'none'
        }
      };
    }
  }, [getColorForUser]);

  const allEmails = useMemo(() => {
    return [session?.user?.email, ...selectedPeople.map(person => person.value)].filter(Boolean);
  }, [session, selectedPeople]);

  const fetchDirectoryPeople = async (inputValue) => {
    if (inputValue.length < 3) return [];
    try {
      const response = await fetch(`/api/directory-people?search=${inputValue}`);
      if (response.ok) {
        const data = await response.json();
        return data.people.map(person => ({
          value: person.email,
          label: `${person.name} (${person.email})`
        }));
      } else {
        console.error('Failed to fetch directory people');
        return [];
      }
    } catch (error) {
      console.error('Error fetching directory people:', error);
      return [];
    }
  };

  const debouncedFetchDirectoryPeople = useCallback(
    debounce((inputValue, callback) => {
      fetchDirectoryPeople(inputValue).then(callback);
    }, 300),
    []
  );

  const loadOptions = (inputValue, callback) => {
    debouncedFetchDirectoryPeople(inputValue, callback);
  };

  const handlePeopleChange = (selectedOptions) => {
    setSelectedPeople(selectedOptions || []);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    window.location.href = '/';
  };

  const handleAvailableSlotsTimezoneChange = (event) => {
    setAvailableSlotsTimezone(event.target.value);
  };

  const generateAvailableSlotsList = useCallback(() => {
    const groupedSlots = selectedSlots.reduce((acc, slot) => {
      const day = moment(slot.start).tz(availableSlotsTimezone).format('MMMM D, YYYY');
      if (!acc[day]) {
        acc[day] = [];
      }
      acc[day].push(slot);
      return acc;
    }, {});

    Object.keys(groupedSlots).forEach(day => {
      groupedSlots[day].sort((a, b) => moment(a.start).diff(moment(b.start)));
    });

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
        <h1>Simple Calendar Sharing App</h1>
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
      <div className="search-container">
        <AsyncSelect
          isMulti
          cacheOptions
          defaultOptions
          loadOptions={loadOptions}
          onChange={handlePeopleChange}
          placeholder="Search for additional people (min. 3 characters)..."
          noOptionsMessage={({ inputValue }) => 
            inputValue.length < 3 ? "Please enter at least 3 characters" : "No results found"
          }
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      <div className="calendar-legend">
        <h3>Calendar Legend:</h3>
        <ul>
          {allEmails.map(email => (
            <li key={email} style={{color: getColorForUser(email)}}>
              {email === session?.user?.email ? `${email} (You)` : email}
            </li>
          ))}
          <li style={{color: 'green'}}>Your Availability Slots</li>
        </ul>
      </div>
      <div className="calendar-view">
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '600px' }}
          onNavigate={setCurrentDate}
          view="week"
          views={['week']}
          selectable
          resizable
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
          formats={formats}
          tooltipAccessor={(event) => event.isAvailability ? 'Your availability' : `${event.title} (${event.email})`}
        />
      </div>
      {modalEvent && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>Available Time Slot</h2>
            <p>Start: {moment(modalEvent.start).format('MMMM D, YYYY h:mm A')}</p>
            <p>End: {moment(modalEvent.end).format('MMMM D, YYYY h:mm A')}</p>
            <div className="modal-buttons">
              <button onClick={() => removeSelectedSlot(modalEvent)} className="remove-button">Remove Slot</button>
              <button onClick={closeModal} className="close-button">Close</button>
            </div>
          </div>
        </div>
      )}
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
  .search-container {
    margin-bottom: 20px;
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
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }
  .modal-content {
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    width: 300px;
    max-width: 90%;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  .remove-button, .close-button {
    padding: 10px 15px;
    margin-left: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  .remove-button {
    background-color: #ff4d4f;
    color: white;
  }
  .close-button {
    background-color: #d9d9d9;
  }
  .remove-button:hover, .close-button:hover {
    opacity: 0.8;
  }
  :global(.react-select-container) {
    width: 100%;
  }
  :global(.react-select__control) {
    border-color: #ccc;
  }
  :global(.react-select__option) {
    cursor: pointer;
  }

  .calendar-legend {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #f9f9f9;
  }
  .calendar-legend h3 {
    margin-top: 0;
    margin-bottom: 10px;
  }
  .calendar-legend ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  .calendar-legend li {
    margin-bottom: 5px;
    font-weight: bold;
  }
  

`}</style>
    </div>
  );
}