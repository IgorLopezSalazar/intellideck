import {Topic} from "../models/topic.ts";
import sanitize from "mongo-sanitize";
import {StatusCodes} from "http-status-codes";

export class TopicController {
    async postTopic(req: any, res: any) {
        let topic = new Topic({
            name: sanitize(req.body.name)
        })
        Topic.create(topic)
            .then((data: any) =>
                res.status(StatusCodes.CREATED).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The topic could not be created");
                console.log(e);
            })
    }

    async deleteTopic(req: any, res: any) {
        Topic.findByIdAndDelete(sanitize(req.params.id))
            .then((data: any) =>
                res.status(StatusCodes.NO_CONTENT).json(data))
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The topic could not be deleted");
                console.log(e);
            })
    }

    async getTopics(req: any, res: any) {
        Topic.find({})
            .then((data: any) => {
                if (!data || data.length == 0) {
                    res.status(StatusCodes.NO_CONTENT).json();
                } else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.INTERNAL_SERVER_ERROR).json("There was an error while retrieving the data");
                console.log(e);
            })
    }

    async putTopic(req: any, res: any) {
        Topic.findByIdAndUpdate(sanitize(req.params.id), {
                name: sanitize(req.body.name)
            },
            {returnOriginal: false})
            .then((data: any) => {
                if(!data) {
                    res.status(StatusCodes.NOT_FOUND).json("Topic not found");
                }
                else {
                    res.status(StatusCodes.OK).json(data);
                }
            })
            .catch((e: any) => {
                res.status(StatusCodes.BAD_REQUEST).json("The topic could not be updated");
                console.log(e);
            })
    }
}