import React, { useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import './Calendar.css'
import useCalendar from '../../store/Calendar'
import { createEventId } from '../../data'
import { IoMdNotifications } from 'react-icons/io'

const Calendar = () => {
    const { currentEvents, setCurrentEvents } = useCalendar()
    const [showNotifications, setShowNotifications] = useState(false);

    // Add this function to get today's events
    const getTodaysEvents = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        return currentEvents.filter(event => {
            const eventDate = new Date(event.start);
            eventDate.setHours(0, 0, 0, 0);
            return eventDate.getTime() === today.getTime();
        });
    };

    const handleEvents = async (events) => {
        await Promise.resolve(setCurrentEvents(events))
    }

    const handleDateSelect = (selectInfo) => {
        let title = prompt('Please enter a title for the event')
        let calendarApi = selectInfo.view.calendar;

        calendarApi.unselect();


        if (title) {
            calendarApi.addEvent({
                id: createEventId(),
                title,
                start: selectInfo.start,
                end: selectInfo.end,
                allDay: selectInfo.allDay
            })
        }
    }

    const handleEventClick = (clickInfo) => {
        if (
            confirm('Are you sure you want to delete this event?')

        ) {
            clickInfo.event.remove()
        }
    }

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <div className="notification-container">
                    <button 
                        className="notification-button"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <IoMdNotifications size={25} />
                        {getTodaysEvents().length > 0 && (
                            <span className="notification-badge">
                                {getTodaysEvents().length}
                            </span>
                        )}
                    </button>
                    {showNotifications && getTodaysEvents().length > 0 && (
                        <div className="notification-dropdown">
                            <h3>Today's Events</h3>
                            {getTodaysEvents().map((event, index) => (
                                <div key={index} className="notification-item">
                                    <span>{event.title}</span>
                                    <span className="event-time">
                                        {new Date(event.start).toLocaleTimeString([], { 
                                            hour: '2-digit', 
                                            minute: '2-digit' 
                                        })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div>
                <FullCalendar
                    plugins={[dayGridPlugin, interactionPlugin, timeGridPlugin]}
                    headerToolbar={{

                        left: 'prev,next today',
                        center: "title",
                        right: "dayGridMonth,timeGridWeek,timeGridDay"

                    }}

                    allDaySlot={false}
                    initialView="timeGridWeek"
                    slotDuration={"01:00:00"}
                    editable={true}
                    selectable={true}
                    selectMirror={true}
                    dayMaxEvents={true}
                    weekends={true}
                    nowIndicator={true}
                    initialEvents={currentEvents}
                    eventsSet={handleEvents}
                    select={handleDateSelect}
                    eventClick={handleEventClick}
                />
            </div>
        </div>
    )
}

export default Calendar