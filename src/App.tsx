import React, { useEffect, useMemo, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import Topic from "./models/Topic";
import AppVariables from "./AppVariables";
import GithubTopic from "./components/GithubTopic/GithubTopic";
import Repo from "./models/Repo";
import GithubRepo from "./components/GithubRepo/GithubRepo";

function App() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [numberOfRepo, setNumberOfRepo] = useState<number>(0);
  const [repo, setRepo] = useState<Repo>(new Repo());

  useMemo(() => {
    // get all the topics
    fetch(AppVariables.ApiUrl + "/api/Rgr/get-github-topics")
      .then((response) => response.text())
      .then((topicsJson) => {
        setTopics(Topic.fromJSON(topicsJson));
      });

    showRandomRepo();
  }, []);

  useEffect(() => {
    // Dès que les topics ont été ajouté on affiche le nbre de repo total
    setSelectedTopics([]);
  }, [topics]);

  useEffect(() => {
    // Calcul le nbre de repo total en fonction des topics sélectionnés
    let somme = 0;

    (selectedTopics.length > 0 ? selectedTopics : topics).forEach((topic) => {
      somme += topics.find(
        (x) => x.Name === (typeof topic === "string" ? topic : topic.Name)
      )!.NumberOfRepo;
    });

    setNumberOfRepo(somme);
  }, [selectedTopics]);

  let searchInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  function showRandomRepo() {
    var topic: string = "";

    if (selectedTopics.length > 0) {
      // Choisi un topic random parmis ceux sélectionné
      topic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
    }

    fetch(
      AppVariables.ApiUrl + "/api/Rgr/get-random-github-repo?topic=" + topic
    )
      .then((response) => response.text())
      .then((repoJson) => {
        setRepo(Repo.fromJSON(repoJson));
      });
  }

  return (
    <div className="App">   
      <h1 className="title">Random Github Repo</h1>

      <div className="parent">
        <div className="topic-container style-1">
          <input
            ref={searchInputRef}
            type="text"
            onKeyUp={() => {
              setSearchTerm(searchInputRef.current!.value);
            }}
            placeholder="Search a topic"
          />

          {topics.map((topic: Topic) => {
            return (
              // Affiche uniquement si ça correspond à la recherche
              topic.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                searchTerm === "" ? (
                <GithubTopic
                  selectedTopics={selectedTopics}
                  key={topic.Id}
                  Topic={topic}
                  setSelectedTopics={setSelectedTopics}
                ></GithubTopic>
              ) : (
                <></>
              )
            );
          })}
        </div>
        <div className="div-right-side">
          {selectedTopics.length > 0 ? (
            <>
              <h2 className="selected-topics-text">
                Selected topic{selectedTopics.length > 1 ? "s" : ""} :{" "}
                {selectedTopics.map((topic, index) => {
                  return (
                    <span>
                      {topic}
                      {index === selectedTopics.length - 1 ? "" : ", "}
                    </span>
                  );
                })}
              </h2>
            </>
          ) : (
            <h2 className="selected-topics-text">No topic selected</h2>
          )}

          <h3 className="number-repo-text">
            Number of repositories : {numberOfRepo.toLocaleString()}
          </h3>

          <div className="div-bottom">
            {repo?.Id !== -1 ? <GithubRepo repo={repo} /> : <></>}
          </div>

          <button className="get-repo-button" onMouseDown={showRandomRepo}>
            <b>Inspire me !</b>
          </button>

          <p className="credit">
        Created by{" "}
        <a
          className="link-credit"
          target="_blank"
          href="https://www.rayanestaszewski.fr"
        >
          Rayane Staszewski
        </a>{" "}
        -{" "}
        <a
          className="link-credit"
          target="_blank"
          href="https://www.github.com/zonetecde"
        >
          GitHub
        </a>{" "}
        -{" "}
        <a
          className="link-credit"
          target="_blank"
          href="https://www.buymeacoffee.com/zonetecde"
        >
          Buy me a coffee
        </a>
      </p>
        </div>       
      </div>
    </div>
  );
}

export default App;
