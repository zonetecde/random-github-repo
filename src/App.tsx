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

  // Contient les repos favoris de l'utilisateur
  const [favoriteRepos, setFavoriteRepos] = useState<number[]>([]);
  const [isShowingFavorite, setIsShowingFavorite] = useState<boolean>(false);

  // Contient le filtre du min et max de star
  const [starFilter, setStarFilter] = useState<[number, number]>([
    0, 1_000_000,
  ]);

  // Fonction qui s'execute après l'initialisaiton de la page
  useMemo(() => {
    // Récupère les repos mis en favoris
    const storedNumbersArrayJSON = Cookie.getCookie("favoriteRepoCookie");
    if (storedNumbersArrayJSON) {
      const storedNumbersArray: number[] = JSON.parse(storedNumbersArrayJSON);
      setFavoriteRepos(storedNumbersArray);
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
    // On sauvegarde l'array dans les cookies
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
    var topics: string = "";

    // Si l'utilisateur a spécifié des topics, on les prends en compte sauf
    // s'il n'y a aucun repo trouvé pour ces topics
    if (selectedTopics.length > 0 && numberOfRepo >= 1) {
      // Choisi un topic random parmis ceux sélectionnés
      topics = selectedTopics.toString();
    }

    // animation (le component va voir que .Id = -1)
    let updatedRepo = { ...repo, Id: -1 };
    setRepo(updatedRepo);

    // Appel à mon API pour avoir un repo random
    fetch(
      AppVariables.ApiUrl +
        "/api/Rgr/get-random-github-repo?topics=" +
        encodeURIComponent(topics) +
        "&minStar=" +
        starFilter[0] +
        "&maxStar=" +
        starFilter[1]
    )
      .then((response) => response.text())
      .then((repoJson) => {
        let _repo = Repo.fromJSON(repoJson);
        setRepo(_repo);

        // si la page markdown est déjà ouverte alors on simule son ouverture
        if (markdownContent !== null)
          showReadme(_repo.Creator + "/" + _repo.RepoName);
      });
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

  // Affiche le read.md
  // repo au format : createur/nom_du_repo
  function showReadme(repo: string) {
    setMarkdownContent("Loading markdown...");

    fetch("https://raw.githubusercontent.com/" + repo + "/master/README.md")
      .then((response) => response.text())
      .then((markdown) => {
        if (markdown === "404: Not Found")
          setMarkdownContent("No README.md found");
        else {
          // remplace toutes les urls d'img relatif en url complète vers l'img dans le repo
          // src="/
          const updatedMarkdown = markdown.replace(
            /!\[([^\]]+)\]\((\/[^)]+\.(png|jpg|jpeg|gif))\)/g,
            `![\$1](https://raw.githubusercontent.com/${repo + "/master/"}\$2)`
          );

          setMarkdownContent(updatedMarkdown);
        }
      });
  }

  // Ajout le repo en favoris
  function addToFavorite(id: number) {
    if (favoriteRepos.includes(id)) {
      // l'enlève des favoris
      let updatedFavoriteRepo = favoriteRepos.filter((topic) => topic !== id);
      setFavoriteRepos(updatedFavoriteRepo);
    } else {
      setFavoriteRepos([...favoriteRepos, id]);
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
            src={isShowingFavorite ? DiceIcon : FavoriteIcon}
            onMouseDown={() => {
              setIsShowingFavorite(!isShowingFavorite);
            }}
          />

          {isShowingFavorite ? (
            <div className="favorite-div">
              <h2 className="title-favorite">{favoriteRepos.length} repositories bookmarked</h2>

              <div className="container-favorite">
                {favoriteRepos.map((repoId)=> {
                  // récupère le repo depuis internet
                  let _repo = new Repo();
                  _repo.Id = repoId;

                  // Appel à mon API pour avoir le repo depuis son Id
                  fetch(
                    AppVariables.ApiUrl +
                      "/api/Rgr/get-github-repo?id=" + repoId                     
                  )
                    .then((response) => response.text())
                    .then((repoJson) => {
                      _repo = Repo.fromJSON(repoJson);
                      setRepo(_repo);
                    });
                                
                  return(<GithubRepo repo={_repo} showReadme={showReadme} isShowingFavorite={isShowingFavorite} addToFavorite={addToFavorite} favoriteRepos={favoriteRepos} />)
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
