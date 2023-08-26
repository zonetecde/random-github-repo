import React from "react";
import Topic from "../../models/Topic";
import "./GithubTopicStyles.css";

interface Props {
  // Le topic que contient ce component
  Topic: Topic;
  // Méthode à appeler si le topic de ce component est sélectionné 
  setSelectedTopics: React.Dispatch<React.SetStateAction<string[]>>;
  // Les topics sélectionnés par l'utilisateur
  selectedTopics: string[];
}

const GithubTopic = (props: Props) => {

  // // 
  // Ce topic s'est fait sélectionner
  function topicSelected() {
    var updatedSelectedTopics: string[] = [];

    // S'il était déjà dans la liste des topics sélectionnés alors on l'enlève
    if (props.selectedTopics.includes(props.Topic.Name)) {
      updatedSelectedTopics = props.selectedTopics.filter(
        (topic) => topic !== props.Topic.Name
      );
      props.setSelectedTopics(updatedSelectedTopics);
    } else {
      // Sinon on l'ajoute parmis les topics sélectionnés
      updatedSelectedTopics = [...props.selectedTopics, props.Topic.Name];
      props.setSelectedTopics(updatedSelectedTopics);
    }
  }

  return (
    <div>
      <div
        className="topic-parent"
        onMouseDown={topicSelected}
        // Effet de "topic sélectionné"
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
