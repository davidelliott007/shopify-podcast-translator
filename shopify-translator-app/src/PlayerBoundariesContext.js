import React, { createContext } from "react";
export const PlayerBoundariesContext = createContext();
var voices = speechSynthesis.getVoices();
let french_voice = voices.filter((v) => v.lang === "fr-CA");
let current__play_head_time;
let current_english_item_end;
let next_english_item_start;
let contextSentenceAndGoodWordCombined = [];

let current = {};
let next = {};

const initialState = {
  shouldMP3StillPlay: true,
  currentTimePlayHead: 0.0,
  timeToPlayFrom: 0.0,
  contextSentenceAndGoodWordCombined: [],
  speakTranslation: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "update-SentenceAndGoodWordCombined": {
      console.log("reducer triggered");
      console.log(action);
      console.log(state);

      contextSentenceAndGoodWordCombined = action.sentenceAndGoodWordCombined;
      return {
        ...state,
        contextSentenceAndGoodWordCombined: action.sentenceAndGoodWordCombined,

        // shouldMP3StillPlay: true,
      };
    }

    case "update-play-head": {
      //   console.log("reducer triggered");
      console.log(action);
      console.log(state);

      return {
        ...state,
        // shouldMP3StillPlay: true,
      };
    }

    case "pause-play-head": {
      // console.log(" pause-play-headreducer triggered");
      // console.log(action);
      // console.log(state);

      return {
        ...state,

        shouldMP3StillPlay: false,
      };
    }

    case "start-play-head": {
      //   console.log("reducer triggered");
      //   console.log(action);
      //   console.log(state);

      return {
        ...state,
        shouldMP3StillPlay: true,
      };
    }

    case "jump-to-english-time": {
      //   console.log("reducer triggered");
      //   console.log(action);
      //   console.log(state);
      console.log(action.timeToPlayFrom);

      return {
        ...state,

        shouldMP3StillPlay: true,
        timeToPlayFrom: action.time_jump,
      };
    }

    case "set-speak-translation": {
      //   console.log("reducer triggered");
      //   console.log(action);
      console.log(state);

      return {
        ...state,
        speakTranslation: action.setSpeech,
      };
    }

    default: {
      console.log("error");
      console.log(action);
    }
  }
}

export const PlayerBoundariesContextProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(reducer, initialState);

  const sendUpdatedPlayHeadPosition = (currentTime) => {
    // console.log("sendUpdatedPlayHeadPosition");

    current__play_head_time = currentTime;
    console.log(current__play_head_time);

    if (
      current.word !== undefined &&
      current__play_head_time > current.last_word.word.end &&
      current__play_head_time - current.last_word.word.end < 0.2
    ) {
      console.log("==========================");
      console.log("just passed!!!1");
      console.log("==========================");
      console.log("==========================");

      setSpeakTranslation(true);

      playSpeechAndThenRestartPlayer(next, current.translated_sentence);

      // dispatch({
      //   type: "pause-play-head",
      // });
    } else if (current.word === undefined) {
      console.log("current undefined");

      contextSentenceAndGoodWordCombined.forEach((sent, i) => {
        if (
          sent.word.word.start < currentTime &&
          sent.last_word.word.end > currentTime
        ) {
          current = sent;
          next = contextSentenceAndGoodWordCombined[i + 1];
        }
      });
    } else if (
      current.word.word.start < currentTime &&
      current.last_word.word.end > currentTime
    ) {
      current = current;
    } else {
      console.log("searching again");

      contextSentenceAndGoodWordCombined.forEach((sent) => {
        if (
          sent.word.word.start < currentTime &&
          sent.last_word.word.end > currentTime
        ) {
          current = sent;
        }
      });
    }

    console.log(current);

    // dispatch({
    //   type: "update-play-head",
    //   ...data,
    // });
  };

  const pausePlayer = () => {
    dispatch({
      type: "pause-play-head",
    });
  };

  const startPlayer = () => {
    dispatch({
      type: "start-play-head",
    });
  };

  const setSpeakTranslation = (setSpeech) => {
    dispatch({
      type: "set-speak-translation",
      setSpeech: setSpeech,
    });
  };

  const getContextSentenceAndGoodWordCombined = () => {
    return {};
  };

  const jumpToEnglishSentenceAndPlay = (timeToJumpTo, sentence) => {
    // console.log(timeToJumpTo);
    // console.log(data);

    // dispatch({
    //   type: "pause-play-head",
    // });

    current = {};

    let time_jump = parseFloat(timeToJumpTo);

    // console.log(time_jump);

    dispatch({
      type: "jump-to-english-time",
      time_jump,
    });
  };

  const updateContextSentenceAndGoodWordCombined = (
    sentenceAndGoodWordCombined
  ) => {
    dispatch({
      type: "update-SentenceAndGoodWordCombined",
      sentenceAndGoodWordCombined: sentenceAndGoodWordCombined,
    });
  };

  const playSpeechAndThenRestartPlayer = (nextItem, utteranceString) => {
    console.log("playSpeech");

    dispatch({
      type: "pause-play-head",
    });

    let utterance = new SpeechSynthesisUtterance(utteranceString);
    utterance.voice = french_voice[0];

    utterance.onend = function (event) {
      console.log(
        "Utterance has finished being spoken after " +
          event.elapsedTime +
          " milliseconds."
      );

      jumpToEnglishSentenceAndPlay(nextItem.word.word.start);

      console.log(event.utterance.text);
    };

    speechSynthesis.speak(utterance);
  };

  return (
    <PlayerBoundariesContext.Provider
      value={{
        state,
        actions: {
          sendUpdatedPlayHeadPosition,
          playSpeechAndThenRestartPlayer,
          pausePlayer,
          startPlayer,
          jumpToEnglishSentenceAndPlay,
          getContextSentenceAndGoodWordCombined,
          updateContextSentenceAndGoodWordCombined,
          setSpeakTranslation,
        },
      }}
    >
      {children}
    </PlayerBoundariesContext.Provider>
  );
};
