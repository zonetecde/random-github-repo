class Repo {
  Creator: string;
  Description: string;
  RepoName: string;
  Tags: string[];
  Category: string;
  ProgramingLanguage: string;
  Star: number;
  ImageUrl: string;
  Id: number;

  constructor() {
    this.Creator = "";
    this.Description = "";
    this.RepoName = "";
    this.Tags = [];
    this.Category = "";
    this.ProgramingLanguage = "";
    this.Star = 0;
    this.ImageUrl = "";
    this.Id = -1;
  }

  static fromJSON(repoJson: string): Repo {
    var jsonObj = JSON.parse(repoJson);

    const repo = new Repo();

    repo.Id = jsonObj.id || 0;
    repo.Creator = jsonObj.creator || "";
    repo.Description = jsonObj.description || "";
    repo.RepoName = jsonObj.repoName || "";
    repo.Tags = jsonObj.tags.split(",");
    repo.Category = jsonObj.Category;
    repo.ProgramingLanguage = jsonObj.programingLanguage;
    repo.ImageUrl = jsonObj.imageUrl;
    repo.Star = jsonObj.star;

    return repo;
  }
}

export default Repo;
