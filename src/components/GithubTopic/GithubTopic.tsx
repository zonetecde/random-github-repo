import React from "react";
import Topic from "../../models/Topic";
import "./GithubTopicStyles.css";

interface Props {
  Topic: Topic;
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
  selectedTopics: string[];
}

const GithubTopic = (props: Props) => {
  function topicSelected() {
    var updatedSelectedTopics: string[] = [];

    // si c'est déjà le topic sélectionner alors on l'enlève
    if (props.selectedTopics.includes(props.Topic.Name)) {
      updatedSelectedTopics = props.selectedTopics.filter(
        (topic) => topic !== props.Topic.Name
      );
      props.setSelectedTopics(updatedSelectedTopics);
    } else {
      updatedSelectedTopics = [...props.selectedTopics, props.Topic.Name];
      props.setSelectedTopics(updatedSelectedTopics);
    }
  }

  return (
    <div>
      <div
        className="topic-parent"
        onMouseDown={topicSelected}
        // effet sélectionner
        style={{
          backgroundColor: props.selectedTopics.includes(props.Topic.Name)
            ? "#2A3B4F"
            : "",
        }}
      >
        {props.Topic.ImgUrl === "" ? (
          <div className="default-icon">#</div>
        ) : (
          <img src={props.Topic.ImgUrl} />
        )}

        <div className="div-topic-information">
          <a className="topic-name" href={props.Topic.Url} target="_blank">
            {props.Topic.Name}
          </a>
          <p className="topic-description">{props.Topic.Description}</p>
        </div>
      </div>

      <div className="separator" />
    </div>
  );
};

export default GithubTopic;
