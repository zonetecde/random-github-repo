import React, { useEffect, useMemo, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import Topic from "./models/Topic";
import AppVariables from "./AppVariables";
import GithubTopic from "./components/GithubTopic/GithubTopic";
import Repo from "./models/Repo";
import GithubRepo from "./components/GithubRepo/GithubRepo";

function App() {
  // Contient tout les topics github
  const [topics, setTopics] = useState<Topic[]>([]);

  // Contient la recherche de la personne sur les topics
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Contient le nom des topics que la personne a sélectionné
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Contient le nombre de repo total (une somme est faite des repos dans `selectedTopics`)
  const [numberOfRepo, setNumberOfRepo] = useState<number>(0);

  // Contient le repo actuellement affiché à l'écran
  const [repo, setRepo] = useState<Repo>(new Repo());

  // Fonction qui s'execute après l'initialisaiton de la page
  useMemo(() => {
    // Récupère tout les topics depuis mon API Web
    fetch(AppVariables.ApiUrl + "/api/Rgr/get-github-topics")
      .then((response) => response.text())
      .then((topicsJson) => {
        setTopics(Topic.fromJSON(topicsJson));
      });

    // Affiche un repo aléatoire
    showRandomRepo();
  }, []);

  // Hook: Les topics ont été ajoutés
  useEffect(() => {
    // On affiche le nbre de repo total en appelant le hook des selectedTopics
    setSelectedTopics([]);
  }, [topics]);

  // Hook: Des topics ont été sélectionnés
  useEffect(() => {
    // Calcul le nbre de repo total qui se trouve dans tout les topics sélectionnés
    let somme = 0;

    // Si aucun topic n'est sélectionné on compte les repos de tout les topics,
    // sinon on compte que ceux sélectionnés
    (selectedTopics.length > 0 ? selectedTopics : topics).forEach((topic) => {
      somme += (typeof topic === "string" ? topics.find(
        (x) => x.Name ===  topic)!.NumberOfRepo : topic.NumberOfRepo) 
    });

    setNumberOfRepo(somme);
  }, [selectedTopics]);

  // Ref à l'input de la recher pour savoir son contenue 
  let searchInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  // // //
  // Affiche un repo random
  function showRandomRepo() {
    var topic: string = "";

    // Si l'utilisateur a spécifié des topics, on les prends en compte
    if (selectedTopics.length > 0) {
      // Choisi un topic random parmis ceux sélectionnés
      topic = selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
    }

    // Appel à mon API pour avoir un repo random
    fetch(
      AppVariables.ApiUrl + "/api/Rgr/get-random-github-repo?topic=" + encodeURIComponent(topic)
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
              // Affiche uniquement le topic si ce dernier se trouve dans la recherche 
              // OU si il n'y a pas de recherche
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
                {/* Affichage des topics sélectionnés, un 's' est ajouté si besoin */}
                Selected topic{selectedTopics.length > 1 ? "s" : ""} :{" "}
                {selectedTopics.map((topic, index) => {
                  return (
                    <span>
                      {topic}
                      {/* On omet la virgule si c'est le dernier topic à afficher */}
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
            {<GithubRepo repo={repo} />}
          </div>

          <button className="get-repo-button" onMouseDown={showRandomRepo}>
            <b>Inspire me !</b>
          </button>

          {/* Crédit du projet */}
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
