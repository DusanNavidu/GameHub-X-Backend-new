import { Request, Response } from "express";
import Tag from "../models/Tag";
import { Status } from "../models/User";

// නම Format කරන Function එක (උදා: " Action 3D! " -> "#action3d")
const formatTagName = (name: string) => {
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return clean ? `#${clean}` : '';
};

// 1. CREATE TAG
export const createTag = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) return res.status(400).json({ message: "Tag name is required" });

        const formattedName = formatTagName(name);
        if (!formattedName) return res.status(400).json({ message: "Invalid tag name" });

        const existingTag = await Tag.findOne({ name: formattedName });
        if (existingTag) return res.status(400).json({ message: "Tag already exists" });

        const tag = await Tag.create({ name: formattedName });
        res.status(201).json({ message: "Tag created successfully", data: tag });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 2. GET ALL TAGS
export const getTags = async (req: Request, res: Response) => {
    try {
        const { search, status, page, limit } = req.query;
        let query: any = {};

        if (search) query.name = { $regex: search.toString().toLowerCase().replace(/[^a-z0-9]/g, ''), $options: "i" };
        if (status) query.status = status;

        const pageNumber = parseInt(page as string) || 1;
        const limitNumber = parseInt(limit as string) || 10;
        const skip = (pageNumber - 1) * limitNumber;

        const total = await Tag.countDocuments(query);
        const tags = await Tag.find(query).sort({ name: 1 }).skip(skip).limit(limitNumber);

        // 🟢 Frontend එකට යවන්න කලින් හැම Tag නමක්ම Simple කරනවා
        const formattedTags = tags.map(tag => ({
            ...tag.toObject(),
            name: tag.name.toLowerCase()
        }));

        res.status(200).json({ 
            data: formattedTags,
            pagination: { total, page: pageNumber, limit: limitNumber, totalPages: Math.ceil(total / limitNumber) }
        });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 3. UPDATE TAG
export const updateTag = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        let formattedName = "";
        if (name) {
            formattedName = formatTagName(name);
            if (!formattedName) return res.status(400).json({ message: "Invalid tag name" });

            const existingTag = await Tag.findOne({ name: formattedName, _id: { $ne: id } });
            if (existingTag) return res.status(400).json({ message: "Tag name already exists" });
        }

        const updatedTag = await Tag.findByIdAndUpdate(id, { $set: { name: formattedName } }, { new: true });
        if (!updatedTag) return res.status(404).json({ message: "Tag not found" });

        res.status(200).json({ message: "Tag updated successfully", data: updatedTag });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 4. TOGGLE STATUS
export const toggleTagStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tag = await Tag.findById(id);
        if (!tag) return res.status(404).json({ message: "Tag not found" });

        const newStatus = tag.status === Status.ACTIVE ? Status.INACTIVE : Status.ACTIVE;
        await Tag.updateOne({ _id: id }, { $set: { status: newStatus } });

        res.status(200).json({ message: `Tag status updated to ${newStatus}` });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};

// 5. GET ALL ACTIVE TAGS WITHOUT PAGINATION (For Admin Game Add Dropdown)
export const getTagsForAdminGameAdd = async (req: Request, res: Response) => {
    try {
        const tags = await Tag.find({ status: Status.ACTIVE }).sort({ name: 1 });
        
        // 🟢 Frontend එකට යවන්න කලින් හැම Tag නමක්ම Simple කරනවා
        const formattedTags = tags.map(tag => ({
            ...tag.toObject(),
            name: tag.name.toLowerCase()
        }));

        res.status(200).json({ data: formattedTags });
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
};