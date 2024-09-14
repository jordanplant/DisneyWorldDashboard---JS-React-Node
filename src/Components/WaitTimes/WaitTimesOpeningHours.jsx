import React, { useState, useEffect } from "react";
import styles from "./WaitTimes.module.css";
import Events from "../Services/Events";
import ParkIcons from "../Common/Icons";
import ButtonContainer from "../Common/ButtonContainer";

// Mapping configurations
const locationParkMapping = {
  Orlando: [
    "75ea578a-adc8-4116-a54d-dccb60765ef9", // Magic Kingdom
    "47f90d2c-e191-4239-a466-5892ef59a88b", // Epcot
    "288747d1-8b4f-4a64-867e-ea7c9b27bad8", // Hollywood Studios
    "1c84a229-8862-4648-9c71-378ddd2c7693", // Animal Kingdom
    "b070cbc5-feaa-4b87-a8c1-f94cca037a18", // Typhoon Lagoon
    "ead53ea5-22e5-4095-9a83-8c29300d7c63", // Blizzard Beach
  ],
  Paris: [
    "dae968d5-630d-4719-8b06-3d107e944401", // Disneyland Park Paris
    "ca888437-ebb4-4d50-aed2-d227f7096968", // Walt Disney Studios Paris
  ],
  // Add more locations and park IDs as needed
};

const parkNameMapping = {
  "Magic Kingdom Park": "Magic Kingdom",
  EPCOT: "Epcot",
  "Disney's Hollywood Studios": "Hollywood Studios",
  "Disney's Animal Kingdom Theme Park": "Animal Kingdom",
  "Disney's Typhoon Lagoon Water Park": "Typhoon Lagoon Water Park",
  "Disney's Blizzard Beach Water Park": "Blizzard Beach Water Park",
  // Add any other variations you need
};

const parkIconMapping = {
  "Magic Kingdom": ParkIcons.MagicKingdom,
  Epcot: ParkIcons.Epcot,
  "Hollywood Studios": ParkIcons.HollywoodStudios,
  "Animal Kingdom": ParkIcons.AnimalKingdom,
  "Disneyland Park": ParkIcons.DisneylandParkParis,
  "Walt Disney Studios Park": ParkIcons.WaltDisneyStudiosParis,
  "Typhoon Lagoon Water Park": ParkIcons.TypoonLagoon,
  "Blizzard Beach Water Park": ParkIcons.BlizzardBeach

};

// Get event name based on date
const getEventName = (date) => {
  if (Events.mnsshp.includes(date)) return "Mickey's Not-So-Scary Halloween Party";
  if (Events.mvmp.includes(date)) return "Mickey's Very Merry Christmas Party";
  return null; // No special event
};

// Component definition
function WaitTimesOpeningHours({ selectedCity }) {
  const [scheduleData, setScheduleData] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [expandedParkIds, setExpandedParkIds] = useState({});

  // Fetch and display opening hours when selectedCity changes
  useEffect(() => {
    const parkIds = locationParkMapping[selectedCity];
    if (parkIds) fetchAndDisplayOpeningHours(parkIds);
  }, [selectedCity]);

  // Fetch park schedules from API
  const fetchAndDisplayOpeningHours = async (parkIds) => {
    setLoadingSchedule(true);
    if (!parkIds.length) {
      console.log("No parks available for this location.");
      setLoadingSchedule(false);
      return;
    }

    try {
      const fetchPromises = parkIds.map((parkId) =>
        fetch(`https://api.themeparks.wiki/v1/entity/${parkId}/schedule`).then((response) => response.json())
      );
      const data = await Promise.all(fetchPromises);

      // Rename park names
      const renamedData = data.map(parkSchedule => ({
        ...parkSchedule,
        name: parkNameMapping[parkSchedule.name] || parkSchedule.name
      }));

      setScheduleData(renamedData);
    } catch (error) {
      console.error("An error occurred:", error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  // Calculate next 5 days
  const calculateNextDays = () => {
    const nextDays = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      nextDays.push({
        date: date.toISOString().split("T")[0],
        formattedDate: date.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
        dayName: date.toLocaleDateString("en-GB", { weekday: "short" })
      });
    }
    return nextDays;
  };

  const handleDateChange = (date) => setSelectedDate(date);

  // Format time according to timezone
  const formatTime = (timestamp, timezone) => {
    let date = new Date(timestamp);
    if (date.getUTCHours() === 0 && timestamp.endsWith("T24:00:00")) {
      date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
    }
    const options = {
      timeZone: timezone,
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleTimeString("en-US", options);
  };

  // Toggle expanded view for park details
  const toggleExpanded = (parkId) => {
    setExpandedParkIds(prevState => ({
      ...prevState,
      [parkId]: !prevState[parkId]
    }));
  };

  const hasAdditionalTimes = (parkSchedule, selectedDate) => {
    return parkSchedule.schedule.some(
      entry =>
        entry.date === selectedDate &&
        (entry.description === "Early Entry" ||
         entry.type === "EXTRA_HOURS" ||
         entry.description === "Extended Evening" ||
         entry.description === "Special Ticketed Event")
    );
  };

  // Generate next days for date buttons
  const nextDays = calculateNextDays();

  return (

    <div className={styles.ParkOpeningTimes}>
      {loadingSchedule ? (
        <p>Loading park information...</p>
      ) : (
        <div className={styles.openingHoursContainer}>
          <div className={styles.ButtonContainer}>
            {nextDays.map(({ date, formattedDate, dayName }) => (
              <div className={styles.dateButtonContainer} key={date}>
                <button
                  onClick={() => handleDateChange(date)}
                  className={date === selectedDate ? styles.active : ""}
                >
                  {formattedDate}
                  <span className={date === selectedDate ? styles.active : ""}>
                    {dayName}
                  </span>
                </button>
              </div>
            ))}
          </div>
          <div className={styles.TimesContainer}>
            {scheduleData.map((parkSchedule) => {
              const ParkIcon = parkIconMapping[parkSchedule.name];
              const isExpanded = expandedParkIds[parkSchedule.id] || false;
              const showExpandButton = hasAdditionalTimes(parkSchedule, selectedDate);
              return (
                <div className={styles.themeParkOpeningHours} key={parkSchedule.id}>
                  <div className={styles.parkDetails}>

                    <div className={styles.parkAndOperating}>
                      <div className={styles.iconAndPark}>
                    {ParkIcon && <ParkIcon active={false} />}
                    <div className={styles.parkAndHours}>
                      <h3 className={styles.parkName}>{parkSchedule.name}</h3>
                      <div className={styles.operatingHours}>
                        {parkSchedule.schedule
                          .filter(
                            (entry) =>
                              entry.date === selectedDate && entry.type === "OPERATING"
                          )
                          .map((entry) => (
                            <div key={entry.type}>
                              <p className={styles.operatingEntryTime}>
                                {formatTime(entry.openingTime, parkSchedule.timezone)} -{" "}
                                {formatTime(entry.closingTime, parkSchedule.timezone)}
                              </p>
                            </div>
                          ))}
                        {!parkSchedule.schedule.some(
                          (entry) =>
                            entry.date === selectedDate && entry.type === "OPERATING"
                        ) && <p className={`${styles.operatingClosed}`}>Closed Today</p>}
                      </div>
                      </div>
                      </div>
                    </div>
                    {showExpandButton && (
  <div className={styles.dropdownButtonContainer}>
    <ButtonContainer
      onClick={() => toggleExpanded(parkSchedule.id)}
      isExpanded={isExpanded}
    />
  </div>
)}
                  </div>

                  {isExpanded && (
                    <div className={styles.expandedHours}>
                      {/* EARLY ENTRY */}
                      {parkSchedule.schedule
                        .filter(
                          (entry) =>
                            entry.date === selectedDate &&
                            entry.description === "Early Entry"
                        )
                        .map((entry) => (
                          <div key={entry.type}>
                            <p className={styles.entryDescription}>{entry.description}</p>
                            <p className={styles.entryTime}>
                              {formatTime(entry.openingTime, parkSchedule.timezone)} -{" "}
                              {formatTime(entry.closingTime, parkSchedule.timezone)}
                            </p>
                          </div>
                        ))}
                      {/* EXTRA HOURS */}
                      {parkSchedule.schedule.some(
                        (entry) =>
                          entry.date === selectedDate && entry.type === "EXTRA_HOURS"
                      ) && (
                        <div>
                          {parkSchedule.schedule
                            .filter(
                              (entry) =>
                                entry.date === selectedDate &&
                                entry.type === "EXTRA_HOURS"
                            )
                            .map((entry) => (
                              <div key={entry.type}>
                                <p className={styles.entryDescription}>{entry.description}</p>
                                <p className={styles.entryTime}>
                                  {formatTime(entry.openingTime, parkSchedule.timezone)} -{" "}
                                  {formatTime(entry.closingTime, parkSchedule.timezone)}
                                </p>
                              </div>
                            ))}
                        </div>
                      )}
                      {/* EXTENDED EVENING */}
                      <div>
                        {parkSchedule.schedule
                          .filter(
                            (entry) =>
                              entry.date === selectedDate &&
                              entry.description === "Extended Evening"
                          )
                          .map((entry) => (
                            <div key={entry.type}>
                              <p className={styles.entryDescription}>
                                {entry.description}
                              </p>
                              <p className={styles.entryTime}>
                                {formatTime(entry.openingTime, parkSchedule.timezone)}{" "}
                                -{" "}
                                {formatTime(entry.closingTime, parkSchedule.timezone)}
                              </p>
                            </div>
                          ))}
                      </div>
                      {/* TICKETED EVENT */}
                      <div>
                        {parkSchedule.schedule
                          .filter(
                            (entry) =>
                              entry.date === selectedDate &&
                              entry.description === "Special Ticketed Event"
                          )
                          .map((entry) => {
                            const eventName = getEventName(entry.date);
                            return (
                              <div key={entry.type}>
                                <p className={styles.entryDescription}>
                                  {eventName || entry.description}
                                </p>
                                <p className={styles.entryTime}>
                                  {formatTime(entry.openingTime, parkSchedule.timezone)} -{" "}
                                  {formatTime(entry.closingTime, parkSchedule.timezone)}
                                </p>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default WaitTimesOpeningHours;