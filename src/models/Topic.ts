class Topic{
    Name: string;
    ImgUrl: string;
    Description: string;
    Url: string;
    Id: number;
    NumberOfRepo: number;
    Tag: string;

    constructor(){
        this.Name = "";
        this.ImgUrl = "";
        this.Description = "";
        this.Url = "";
        this.Tag = "";
        this.NumberOfRepo = 0;
        this.Id = 0;
    }

    static fromJSON(topicsJson: string): Topic[] {
        const topics: Topic[] = [];

        var jsonObj = JSON.parse(topicsJson);

        for (const topicJson of jsonObj) {            
            const topic = new Topic();

            topic.Name = topicJson.name || "";
            topic.ImgUrl = topicJson.imageUrl || "";
            topic.Description = topicJson.description || "";
            topic.Url = topicJson.url || "";
            topic.Id = topicJson.id || 0;
            topic.Tag = topicJson.tag || "";
            topic.NumberOfRepo = topicJson.numberOfRepo || 0;

            topics.push(topic);
        }

        return topics;
    }
}

export default Topic;