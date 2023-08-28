import React, { useEffect, useMemo, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

import Topic from "./models/Topic";
import AppVariables from "./AppVariables";
import GithubTopic from "./components/GithubTopic/GithubTopic";
import Repo from "./models/Repo";
import GithubRepo from "./components/GithubRepo/GithubRepo";

import LoadingWheel from "./icons/loading.gif";
import FavoriteIcon from "./icons/favorite.png";
import RemoveIcon from "./icons/remove.png";
import DiceIcon from "./icons/dice.png";

import remarkGfm from "remark-gfm";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";

import Cookie from "./extension/cookieExt";

function App() {
  // Contient tout les topics github
  const [topics, setTopics] = useState<Topic[]>([]);

  // Contient la recherche de la personne sur les topics
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Contient le nom des topics que la personne a sélectionné
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  // Contient le nombre de repo total (une somme est faite des repos dans `selectedTopics`)
  const [numberOfRepo, setNumberOfRepo] = useState<number>(-1);

  // Contient le repo actuellement affiché à l'écran
  const [repo, setRepo] = useState<Repo>(new Repo());

  // Contient le code markdown du repo en cours
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);

  // Contient si l'utilisateur demande l'ajout d'un nouveau topic
  const [isAskingForTopic, setIsAskingForTopic] = useState<boolean>(false);
  const [addingTopicInfo, setAddingTopicInfo] = useState<string>("");

  // Contient les repos favoris de l'utilisateur
  const [favoriteRepos, setFavoriteRepos] = useState<Repo[]>([]);
  const [isShowingFavorite, setIsShowingFavorite] = useState<boolean>(false);

  // Contient le filtre du min et max de star
  const [starFilter, setStarFilter] = useState<[number, number]>([
    0, 1_000_000,
  ]);

  // Fonction qui s'execute après l'initialisaiton de la page
  useMemo(() => {
    // Récupère les repos mis en favoris
    const storedNumbersArrayJSON = Cookie.getCookie("favoriteRepoCookie");
    let storedRepoArray: Repo[] = [];
    if (storedNumbersArrayJSON) {
      storedRepoArray = JSON.parse(storedNumbersArrayJSON);
      setFavoriteRepos(storedRepoArray);
    } else {
      setFavoriteRepos([]);
    }
    // Récupère tout les topics depuis mon API Web
    fetch(AppVariables.ApiUrl + "/api/Rgr/get-github-topics")
      .then((response) => response.text())
      .then((topicsJson) => {
        setTopics(Topic.fromJSON(topicsJson));
      });

    // Affiche un repo aléatoire
    showRandomRepo();
  }, []);

  // Hook: Repos en favoris mis à jour
  useEffect(() => {
    // On sauvegarde l'array des repos favoris dans les cookies
    Cookie.setCookie(
      "favoriteRepoCookie",
      JSON.stringify(favoriteRepos),
      365 * 5
    );
  }, [favoriteRepos]);

  // Hook: Les topics ont été ajoutés
  useEffect(() => {
    // On affiche le nbre de repo total en appelant le hook des selectedTopics
    setSelectedTopics([]);
  }, [topics]);

  // Hook: Le filtre des stars a été modifié
  useEffect(() => {
    // On affiche le nbre de repo total en appelant le hook des selectedTopics
    updateRepoCount();
  }, [starFilter]);

  // Hook: Des topics ont été sélectionnés
  useEffect(() => {
    updateRepoCount();
  }, [selectedTopics]);

  // Ajoute le topic demandé
  function addTopic(){
    let topicName:string = topicNameInputRef.current?.value!;
    let topicDescription:string = topicDescriptionInputRef.current?.value!;
    let topicTag:string = topicTagInputRef.current?.value!;
    if(topicName === "" || topicTag === ""){
      setAddingTopicInfo("Please fill the topic name and tag fields");
      return;
    }

    const existingTopic = topics.find((t) => t.Tag === topicTag);
    if (existingTopic) {
      setAddingTopicInfo("This topic already exists under the name of " + existingTopic.Name);
      return;
    }

  fetch(AppVariables.ApiUrl + "/api/rgr/add-github-topic?name=" + encodeURIComponent(topicName) + "&description=" + encodeURIComponent(topicDescription) + "&tag=" + encodeURIComponent(topicTag), {
    method: "POST"
  });

  setAddingTopicInfo("The topic \"" + topicName + "\" has been successfully added.\n\nPlease reload the page to see the topic");
  }

  /**
  * Met à jour le nombre de référentiels en effectuant un appel API pour récupérer le nombre total de référentiels
  * en fonction des sujets sélectionnés, des filtres d'étoiles.
  */  
  function updateRepoCount() {
    // Get le nbre de repo total qui se trouve dans tout les topics sélectionnés
    // Le temps de faire l'appel API on le met à -1
    setNumberOfRepo(-1);

    fetch(
      AppVariables.ApiUrl +
        "/api/Rgr/repo-counter?topics=" +
        encodeURIComponent(selectedTopics.toString()) +
        "&minStar=" +
        starFilter[0] +
        "&maxStar=" +
        starFilter[1]
    )
      .then((response) => response.text())
      .then((number) => {
        setNumberOfRepo(Number(number));
      });
  }

  // Ref à l'input de la recher pour savoir son contenue
  let searchInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  // Ref aux inputs des filtres
  let minStarInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  let maxStarInputRef: React.RefObject<HTMLInputElement> = React.createRef();

  // Ref à la form pour add des topics
  let topicNameInputRef: React.RefObject<HTMLInputElement> = React.createRef();
  let topicDescriptionInputRef: React.RefObject<HTMLTextAreaElement> = React.createRef();
  let topicTagInputRef: React.RefObject<HTMLInputElement> = React.createRef();


  const handleKeyDown = (event: KeyboardEvent) => {
    // Handle the keydown event here
    if (
      event.key === " " &&
      document.activeElement?.className !== "search-input" &&
      markdownContent === null
    ) {
      showRandomRepo();
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [repo, markdownContent]);

  // // //
  // Affiche un repo random
  function showRandomRepo() {
    // Si l'utilisateur a spécifié des topics, on les prends en compte sauf
    // s'il n'y a aucun repo trouvé pour ces topics
    if (numberOfRepo >= 1 || numberOfRepo === -1) {
      // Choisi un topic random parmis ceux sélectionnés
      var topics = selectedTopics.toString();

      // animation (le component va voir que .Id = -1)
      let updatedRepo = { ...repo, Id: -1 };
      setRepo(updatedRepo);

      // Appel à mon API pour avoir un repo random
      fetch(`${AppVariables.ApiUrl}/api/Rgr/get-random-github-repo?topics=${encodeURIComponent(topics)}&minStar=${starFilter[0]}&maxStar=${starFilter[1]}`)
        .then((response) => response.text())
        .then((repoJson) => {
          let _repo = Repo.fromJSON(repoJson);
          setRepo(_repo);

          // si la page markdown est déjà ouverte alors on simule son ouverture
          if (markdownContent !== null)
            showReadme(`${_repo.Creator}/${_repo.RepoName}`);
        });
    }
  }


  // Met à jour le filtre, mais attend d'abord
  // 2 secondes pour être sûrs que rien n'est touché
  let timer: NodeJS.Timeout | undefined;
  function starFilterChanged() {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      // Modifie le filtre des étoiles
      setStarFilter([
        Number(
          minStarInputRef.current!.value === ""
            ? 0
            : minStarInputRef.current!.value
        ),
        Number(
          maxStarInputRef.current!.value === ""
            ? 1_000_000
            : maxStarInputRef.current!.value
        ),
      ]);
    }, 1250);
  }

  // Affiche le readme.md
  // repo au format : createur/nom_du_repo
// Affiche le read.md
// repo au format : createur/nom_du_repo
async function showReadme(repo: string) {
  setMarkdownContent("Loading markdown...");

  try {
    const response = await fetch(`https://raw.githubusercontent.com/${repo}/master/README.md`);
    const markdown = await response.text();

    if (markdown === "404: Not Found") {
      setMarkdownContent("No README.md found");
    } else {
      const updatedMarkdown = markdown.replace(
        /!\[([^\]]+)\]\((\/[^)]+\.(png|jpg|jpeg|gif))\)/g,
        `![\$1](https://raw.githubusercontent.com/${repo}/master/\$2)`
      );

      setMarkdownContent(updatedMarkdown);
    }
  } catch (error: any) {
    setMarkdownContent("Error loading markdown\n\n" + error.message);
  }
}

  // Ajout le repo en favoris
  function addToFavorite(repo: Repo) {
    if(repo.Id !== -1)
    {
      if (favoriteRepos.includes(repo)) {
        // l'enlève des favoris
        let updatedFavoriteRepo = favoriteRepos.filter((_repo) => _repo.Id !== repo.Id);
        setFavoriteRepos(updatedFavoriteRepo);
      } else {
        setFavoriteRepos([...favoriteRepos, repo]);
      }
    }
  }

  return (
    <div className="App">
      <h1 className="title">
        {markdownContent === null ? "Random Github Repo" : "README.md"}
      </h1>

      <div className="parent">
        <div className="div-left-side topic-container" style={{display: isShowingFavorite ? "none" : ""}}>
          <input
            className="search-input"
            ref={searchInputRef}
            type="text"
            onChange={() => {
              setSearchTerm(searchInputRef.current!.value);
            }}
            placeholder="Search a topic"
          />

          <div className="topic-container style-1">
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

            <div>
              <p className="p-no-topic">{isAskingForTopic ? "Add a new topic" : "You can't find what you're looking for ?"}</p>
              <form className="form-add-new-topic" style={{display: isAskingForTopic ? "" : "none"}}>
              <p className="p-topic-info">{addingTopicInfo}</p>
              <input maxLength={32} ref={topicNameInputRef} className="input-add-topic" type="text" placeholder="Topic name | e.g. C#"/>
              <input maxLength={32} ref={topicTagInputRef} className="input-add-topic" type="text" placeholder="Tag | e.g. csharp" />
              <br/>
              <textarea className="input-add-topic input-description" ref={topicDescriptionInputRef} placeholder="Description | e.g. C# is a programming language for developing applications"/>
              <br/><br/>
              </form>
              <button style={{display: isAskingForTopic ? "" : "none"}} className="button-ask-for-topic button-add-the-topic" onClick={() => addTopic()}>Add the topic</button>
              <button  className="button-ask-for-topic" style={{width: isAskingForTopic ? "15vh" : ""}} onClick={() => setIsAskingForTopic(!isAskingForTopic)}>{isAskingForTopic ? "Cancel" : "Ask for it !"}</button>
            </div>
          </div>

          <div className="div-star-filter">
            <form className="form-star">
              <p className="p-star-filter">
                Minimum star :{" "}
                <input
                  className="star-input"
                  min="0"
                  max="1000000"
                  type="number"
                  onChange={starFilterChanged}
                  ref={minStarInputRef}
                  defaultValue="0"
                />
              </p>

              <p className="p-star-filter">
                Maximum star :{" "}
                <input
                  className="star-input"
                  min="0"
                  max="1000000"
                  type="number"
                  onChange={starFilterChanged}
                  ref={maxStarInputRef}
                  defaultValue="1000000"
                />
              </p>
            </form>
          </div>
        </div>

        <div className="div-right-side style-1" style={{width: isShowingFavorite ? "100%" : ""}}>
          <img
            className="favorite-icon"
            src={isShowingFavorite ? RemoveIcon : FavoriteIcon}
            onMouseDown={() => {
              setIsShowingFavorite(!isShowingFavorite);
            }}
          />

          {isShowingFavorite ? (
            <div className="favorite-div">
              <h2 className="title-favorite">{favoriteRepos.length === 0 ? "No bookmarked repository" : favoriteRepos.length + " bookmarked repositor" + (favoriteRepos.length > 1 ? "ies" : "y")}</h2>

              <div className="container-favorite">
                {favoriteRepos.map((_repo: Repo)=> {                               
                  return(<GithubRepo repo={_repo} key={_repo.Id} showReadme={showReadme} isShowingFavorite={isShowingFavorite} addToFavorite={addToFavorite} favoriteRepos={favoriteRepos} />)
                })}
              </div>
            </div>
          ) : (
            <div>
              {selectedTopics.length > 0 ? (
                <>
                  <h2 className="selected-topics-text">
                    {/* Affichage des topics sélectionnés, un 's' est ajouté si besoin */}
                    Selected topic{selectedTopics.length > 1 ? "s" : ""} :{" "}
                    {selectedTopics.map((topic, index) => {
                      return (
                        <span
                          key={index}
                          className="topic-text"
                          onMouseDown={() =>
                            setSelectedTopics(
                              selectedTopics.filter((x) => x !== topic)
                            )
                          }
                        >
                          <span>{topic}</span>

                          <img className="icon-delete-topic" src={RemoveIcon} />

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
                Number of repositories :{" "}
                {numberOfRepo !== -1 ? (
                  <span style={{ color: numberOfRepo === 0 ? "red" : "green" }}>
                    {numberOfRepo.toLocaleString()}
                  </span>
                ) : (
                  <img className="loading-wheel" src={LoadingWheel} />
                )}
              </h3>

              <div className="div-bottom">
                {
                  <GithubRepo
                    favoriteRepos={favoriteRepos}
                    addToFavorite={addToFavorite}
                    showReadme={showReadme}
                    repo={repo}
                    isShowingFavorite={isShowingFavorite}
                  />
                }
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
          )}
        </div>

        <div
          className="markdown-shower"
          onMouseDown={(e) => {
            if ((e.target as HTMLInputElement).className === "markdown-shower")
              setMarkdownContent(null);
          }}
          style={{
            transform: markdownContent === null ? "scale(0)" : "scale(1)",
          }}
        >
          <div className="markdown-page style-1">
            <img
              src={RemoveIcon}
              className="remove-icon-md"
              onMouseDown={() => setMarkdownContent(null)}
            />
            
            {/*@ts-expect-error*/}
            <ReactMarkdown rehypePlugins={[rehypeRaw]} remarkPlugins={[remarkGfm]} children={markdownContent ?? ""} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
