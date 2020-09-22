import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";

import styled from "styled-components";
import "./App.css";
import AudioPlayer from "react-h5-audio-player";
import R5stylesSmall from "./r5Audiostyles.css";

import { MP3_PLAYER_STATES } from "./constants";
import {
  getTimeToJumpTo,
  getUUIDsandTimes,
  getMP3PlayerState,
  getTranslationPlaying,
} from "./reducers";

import {
  addCurrentTime,
  changeUUIDPlaying,
  markEnglishAsPlaying,
  recordMP3PlayerState,
  markTranslationAsPlaying,
} from "./actions";

let prev;
let next;
let current;
let last_time_frame = 0.0;

function Player() {
  const dispatch = useDispatch();

  let mp3PlayerState = useSelector(getMP3PlayerState);

  let uuids_and_times = useSelector(getUUIDsandTimes);

  let timeToJumpTo = useSelector(getTimeToJumpTo);

  let translationPlaying = useSelector(getTranslationPlaying);

  const audioref = React.useRef(null);

  React.useEffect(() => {
    if (mp3PlayerState === MP3_PLAYER_STATES.PLAYING) {
      audioref.current.audio.current.play();
    } else if (mp3PlayerState === MP3_PLAYER_STATES.PAUSED) {
      audioref.current.audio.current.pause();
    }
  }, [mp3PlayerState]);

  React.useEffect(() => {
    console.log("time to jump to useEffect fired");

    if (timeToJumpTo > 0.0) {
      audioref.current.audio.current.currentTime = timeToJumpTo;
    }

    // eslint-disable-next-line
  }, [timeToJumpTo]);

  function quickishFindUUID(current_time) {
    // console.log("quickishFindUUID");
    // console.log(current_time);

    let uuid = uuids_and_times.find(
      (element) => current_time > element.start && current_time < element.end
    );

    // if (uuid !== undefined) {
    //   dispatch(
    //     markEnglishAsPlaying({
    //       time_code_from_player: current_time,
    //       english_time_code_from_db: uuid.start,
    //       english_uuid: uuid.uuid,
    //       type_curently_playing: "English",
    //     })
    //   );
    if (uuid !== undefined) {
      dispatch(changeUUIDPlaying(uuid));
    }
    // if (
    //   current_time > current_english_uuid.start &&
    //   current_time < current_english_uuid.end
    // ) {
    //   // do nothing
    // } else {
    //   let uuid = uuids_and_times.find(
    //     (element) => current_time > element.start && current_time < element.end
    //   );

    //   current_english_uuid = uuid;
    // }
    // let uuid = uuids_and_times.find(
    //   (element) => current_time > element.start && current_time < element.end
    // );

    // console.log(current_english_uuid);
  }

  function announceListen(event) {
    let current_time = event.srcElement.currentTime;

    quickishFindUUID(current_time);
    dispatch(addCurrentTime({ current_time }));

    if (Math.abs(last_time_frame - current_time) > 2.0) {
      console.log("========----==========================================");

      console.log("likely jog");
      aSynchFindUUID(current_time);
    }

    last_time_frame = current_time;
  }

  async function aSynchFindUUID(current_time) {
    console.log("aSynchFindUUID findUUID");

    let array_i;
    let closest_to_start = 9999999999999999.0;
    let closest_to_previous_end = 99999999999.0;

    console.log(uuids_and_times);

    if (uuids_and_times !== undefined) {
      for (let i = 0; i < uuids_and_times.length - 1; i++) {
        if (
          current_time > uuids_and_times[i].start &&
          current_time < uuids_and_times[i].end
        ) {
          array_i = i;
          console.log("found");
          console.log("------------------");
        }
      }

      if (array_i === undefined) {
        console.log("array_i wasa undefined");
        for (let i = 0; i < uuids_and_times.length - 1; i++) {
          let distance_to_previous_end = uuids_and_times[i].end - current_time;

          if (
            distance_to_previous_end > 0 &&
            distance_to_previous_end < closest_to_previous_end
          ) {
            closest_to_previous_end = distance_to_previous_end;
            array_i = i;
          }
        }
      }

      console.log("current time:");

      console.log(current_time);

      console.log(closest_to_start);
      console.log(array_i);
      console.log(uuids_and_times[array_i]);

      let uuid = uuids_and_times.find(
        (element) => current_time > element.start && current_time < element.end
      );

      if (array_i === 0) {
        prev = uuids_and_times[array_i];
      } else {
        prev = uuids_and_times[array_i - 1];
      }

      if (array_i === [uuids_and_times.length - 1]) {
        next = uuids_and_times[array_i];
      } else {
        next = uuids_and_times[array_i + 1];
      }

      current = uuids_and_times[array_i];

      console.log(array_i);
      if (array_i !== undefined) {
        console.log("Player  162");

        if (uuid !== undefined) {
          dispatch(changeUUIDPlaying(uuid));
        }

        if (translationPlaying === false) {
          dispatch(
            markEnglishAsPlaying({
              time_code_from_player: current_time,
              english_time_code_from_db: current.start,
              english_uuid: current.uuid,
              type_curently_playing: "English",
              prev_uuid: prev.start,
              prev_tc: prev.start,
              next_uuid: next.uuid,
              next_tc: next.start,
            })
          );
        } else if (translationPlaying) {
          dispatch(
            markTranslationAsPlaying({
              time: current_time,
              translated_uuid: current.uuid,
            })
          );
        }
      }
    }
  }

  function onPauseListen(event) {
    dispatch(recordMP3PlayerState(MP3_PLAYER_STATES.PAUSED));
  }

  function onPlayListen(event) {
    if (mp3PlayerState !== "playing") {
      dispatch(recordMP3PlayerState(MP3_PLAYER_STATES.PLAYING));
    }
  }

  return (
    <PlayerWrapper id={"hello"}>
      <AudioPlayer
        src="https://dts.podtrac.com/redirect.mp3/cdn.simplecast.com/audio/1153d0/1153d031-e1ea-4aa1-8df0-78aa8be2c970/d51660c6-600d-4376-92ea-0e270af97b46/ep374-healthish_tc.mp3"
        customAdditionalControls={[]}
        onPlay={onPlayListen}
        onListen={announceListen}
        listenInterval={200}
        onPause={onPauseListen}
        autoPlay={false}
        customVolumeControls={[]}
        ref={audioref}
        style={{
          outline: "none",
          paddingBottom: "0px",
        }}
        styles={R5stylesSmall}
        id={"hello2"}

        // customIcons={{ play: noPlay }}
        // other props here
      />
    </PlayerWrapper>
  );
}
const PlayerWrapper = styled.div``;

export default Player;
