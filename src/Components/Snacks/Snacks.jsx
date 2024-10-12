import React, { useState } from "react";
import styles from "./SnacksList.module.css";
import ButtonContainer from "../Common/ButtonContainer";
import Rating from "./SnackRating";

const Snacks = ({
  snacks,
  setSnacks,
  handleComplete,
  handleEdit,
  handleDelete,
  handleUndocomplete,
  activeTab,
  selectedParks,
}) => {
  const [loadingSnackId, setLoadingSnackId] = useState(null);

  // Filter snacks based on selected parks and active tab
  const filteredSnacks = snacks.filter((snack) => {
    const isCompleted = snack.completed;
    const isActiveTabCompleted = activeTab === "completedSnacks";
    const isParkSelected = selectedParks.includes(snack.park);
    return (isActiveTabCompleted ? isCompleted : !isCompleted) && isParkSelected;
  });

  const getNoResultsMessage = () => {
    if (activeTab === "outstandingSnacks") {
      return "Oh no! It looks like your snack quest is empty! 🥺";
    } else if (activeTab === "completedSnacks") {
      return "It looks like you haven't tasted any treats from this park yet! 🍭";
    }
    return "Hmm, it seems like there's nothing here! 🍔 What deliciousness are you looking for?";
  };

  const handleShowRating = (id) => {
    const updatedSnacks = snacks.map((snack) =>
      snack.id === id ? { ...snack, isRating: true } : snack
    );
    setSnacks(updatedSnacks);
  };

  const handleCompleteWithRating = async (
    id,
    rating,
    title,
    price,
    location
  ) => {
    setLoadingSnackId(id);
    try {
      const updatedSnacks = snacks.map((snack) =>
        snack.id === id
          ? { ...snack, rating, completed: true, isRating: false }
          : snack
      );
      setSnacks(updatedSnacks);
    } catch (error) {
      console.error("Failed to update snack rating:", error);
    } finally {
      setLoadingSnackId(null);
    }
  };

  const handleSkipRating = async (snack) => {
    const { id, title, price, location } = snack;
    await handleCompleteWithRating(id, null, title, price, location);
  };

  const handleDeleteWithLoading = async (id) => {
    setLoadingSnackId(id);
    await handleDelete(id);
    setTimeout(() => setLoadingSnackId(null), 500);
  };

  const handleUndocompleteWithLoading = async (id) => {
    setLoadingSnackId(id);
    try {
      await handleUndocomplete(id);
    } catch (error) {
      console.error("Failed to uncomplete snack:", error);
    } finally {
      setLoadingSnackId(null);
    }
  };

  return (
    <div>
      <ul className={styles.snacksList}>
        {filteredSnacks.length === 0 ? (
          <p className="no-results-message">
            {getNoResultsMessage()}
          </p>
        ) : (
          filteredSnacks.map((snack) => (
            <li
              key={snack.id}
              className={`${styles.snack} ${
                snack.completed ? styles.completed : ""
              }`}
            >
              <div className={styles.leftContent}>
                <button
                  className={`${styles.buttonComplete} ${
                    snack.completed ? styles.completedButton : ""
                  }`}
                  onClick={() => {
                    snack.completed
                      ? handleUndocompleteWithLoading(snack.id)
                      : handleShowRating(snack.id);
                  }}
                  disabled={loadingSnackId === snack.id}
                >
                  {loadingSnackId === snack.id ? (
                    <i className="fa-solid fa-spinner fa-spin-pulse"></i>
                  ) : (
                    <i className="far fa-check-circle fa-xs"></i>
                  )}
                </button>

                <div className={styles.snackContainer}>
                  {snack.isRating ? (
                    <Rating
                      snack={snack}
                      onSubmit={handleCompleteWithRating}
                      onSkip={() => handleSkipRating(snack)}
                    />
                  ) : (
                    <>
                      <span className={styles.snackTitle}>{snack.title}</span>
                      <div className={styles.snacksInfo}>
                        <span className={styles.snackPrice}>
                          ${snack.price}
                        </span>
                        <span> - </span>
                        <span className={styles.snackLocation}>
                          {snack.location}, {snack.park}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              {!snack.isRating && (
                <div className={styles.SnackButtonContainer}>
                  <ButtonContainer
                    buttons={[
                      {
                        type: "Edit",
                        onClick: () => handleEdit(snack),
                        disabled: !snack || snack.completed,
                        icon: "far fa-pen-to-square fa-xs",
                      },
                      {
                        type: "Delete",
                        onClick: () => handleDeleteWithLoading(snack.id),
                        disabled: false,
                        icon: "fas fa-trash fa-xs",
                      },
                    ]}
                  />
                </div>
              )}
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default Snacks;
