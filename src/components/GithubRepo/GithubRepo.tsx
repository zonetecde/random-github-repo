import Repo from "../../models/Repo";
import "./GithubRepoStyles.css";

import LoadingIcon from '../../icons/loading.gif'

interface Props {
  repo: Repo;
  showReadme(repo: string): void;
  addToFavorite(repo: Repo): void;
  favoriteRepos:Repo[];
  isShowingFavorite:boolean;
}

const GithubRepo = (props: Props) => {
  // // // //
  // Fonction permettant de convertir un nombre en
  // une chaine de caractères avec des lettres pour
  // remplacer les milliers et les millions
  function formatNumberWithAbbreviation(number: number): string {
    if (number >= 1000 && number < 1000000) {
      return (number / 1000).toFixed(1) + "k";
    } else if (number >= 1000000) {
      return (number / 1000000).toFixed(1) + "M";
    } else {
      return number.toString();
    }
  }

  return (
    <div className="repo-parent" style={{transform: props.repo.Id === -1 || props.isShowingFavorite ? "scale(0.9)" : "scale(1)"}}>
      
      {props.repo.Id === -1 || (props.isShowingFavorite && props.repo.Creator === "")  ? <div className="loading-div"><img src={LoadingIcon} className="loading-icon"/></div> : <></>}
      
      <div className="above">
        <svg
          height="2.7vh"
          viewBox="0 0 16 16"
          version="1.1"
          width="2.7vh"
          className="repo-icon"
        >
          <path d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"></path>
        </svg>
        <a
          href={"https://www.github.com/" + props.repo.Creator}
          target="_blank"
          className="link"
        >
          {props.repo.Creator}

          <p className="link tiret">/</p>
        </a>
        <a
          href={
            "https://www.github.com/" +
            props.repo.Creator +
            "/" +
            props.repo.RepoName
          }
          target="_blank"
          className="link a-repoName"
        >
          <b>{props.repo.RepoName}</b>
        </a>

        <div className="right-side">
          <p
            className="p-programing-language"
            style={{
              // Si le langage de prog n'est pas précisé alors on cache le paragraphe
              visibility:
                props.repo.ProgramingLanguage === "" ? "hidden" : "visible",
            }}
          >
            {props.repo.ProgramingLanguage}
          </p>

          <div className="div-star">
            <svg
              className="star-icon"
              height="2vh"
              viewBox="0 0 16 16"
              version="1.1"
              width="2vh"
            >
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"></path>
            </svg>
            <p className="p-star">
              {formatNumberWithAbbreviation(props.repo.Star)}
            </p>
          </div>
        </div>
      </div>

      <div className="bottom style-1">
        <p
          className="description"
          // Certaine description contienne du code HTML
          dangerouslySetInnerHTML={{ __html: props.repo.Description }}
        ></p>

        <div className="tag-container">
          {props.repo.Tags.map((tag) => {
            return tag !== "" ? (
              <div
                key={tag}
                onMouseDown={() => {
                  window.open("https://www.github.com/topics/" + tag, "_blank");
                }}
                className="tag"
              >
                {tag}
              </div>
            ) : (
              <></>
            );
          })}
        </div>
      </div>

      <button className="bottom-p add-to-favorite-p" style={{backgroundColor: props.favoriteRepos.includes(props.repo) ? "#0b4d33" : "" }} onMouseDown={()=>props.addToFavorite(props.repo)}>{props.favoriteRepos.includes(props.repo) ? "Unfavorite" : "Favorite"}</button>
      <button className="bottom-p show-readme-p" onMouseDown={()=>props.showReadme(props.repo.Creator + "/" +props.repo.RepoName)}>README.md</button>
    </div>
  );
};

export default GithubRepo;
