import { Request, Response } from "express";
import Category, { CategoryStatus } from "../models/Category"; // ඔයාගේ Category model එක තියෙන තැනට path එක හදන්න

// 1. CREATE - අලුත් Category එකක් සෑදීම
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    // නම දැනටමත් තියෙනවද කියලා බලනවා (Case-insensitive)
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({ message: "Category name already exists" });
    }

    const category = await Category.create({ name, description });

    res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("createCategory Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 2. GET ALL & SEARCH - සියලුම Categories ගැනීම සහ Search කිරීම
export const getCategories = async (req: Request, res: Response) => {
  try {
    // Frontend එකෙන් ?search=action හෝ ?status=ACTIVE වගේ එව්වොත් ගන්නවා
    const { search, status } = req.query;
    
    let query: any = {};

    // Search keyword එකක් තියෙනවා නම් නමෙන් හොයනවා
    if (search) {
      query.name = { $regex: search, $options: "i" }; // "i" නිසා Simple/Capital ප්‍රශ්නයක් නෑ
    }

    // Status එකක් විශේෂයෙන් ඉල්ලලා නම් ඒක දානවා
    if (status) {
      query.status = status;
    }

    // අලුත්ම ඒවා උඩින් එන්න sort කරනවා (createdAt: -1)
    const categories = await Category.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (err) {
    console.error("getCategories Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. UPDATE - Category එකක් වෙනස් කිරීම (නම සහ විස්තරය)
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // වෙනස් කරන නම වෙන Category එකකට දැනටමත් තියෙනවද බලනවා
    if (name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id } // තමන්ගේම ID එක ඇරෙන්න වෙන අයට මේ නම තියෙනවද බලනවා
      });

      if (existingCategory) {
        return res.status(400).json({ message: "Category name already exists" });
      }
    }

    // Update කරනවා
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: { name, description } },
      { new: true } // Update වුණු අලුත් data එක return කරන්න
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Category updated successfully",
      data: updatedCategory,
    });
  } catch (err) {
    console.error("updateCategory Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 4. TOGGLE STATUS - Active හෝ Inactive කිරීම
export const toggleCategoryStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // දැනට ACTIVE නම් INACTIVE කරනවා, INACTIVE නම් ACTIVE කරනවා
    const newStatus = category.status === CategoryStatus.ACTIVE 
      ? CategoryStatus.INACTIVE 
      : CategoryStatus.ACTIVE;

    // Save කරනවා
    await Category.updateOne(
      { _id: id },
      { $set: { status: newStatus } }
    );

    res.status(200).json({
      message: `Category status updated to ${newStatus}`,
      data: { _id: id, status: newStatus }
    });
  } catch (err) {
    console.error("toggleCategoryStatus Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};