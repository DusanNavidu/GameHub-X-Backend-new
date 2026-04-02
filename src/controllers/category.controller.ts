import { Request, Response } from "express";
import Category, { CategoryStatus } from "../models/Category"; 

// 1. CREATE - අලුත් Category එකක් සෑදීම
export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

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

// 2. GET ALL & SEARCH - සියලුම Categories ගැනීම (Pagination සහ Search සමග)
export const getCategories = async (req: Request, res: Response) => {
  try {
    const { search, status, page, limit } = req.query;
    
    let query: any = {};

    // Search
    if (search) {
      query.name = { $regex: search, $options: "i" }; 
    }

    // Status filter
    if (status) {
      query.status = status;
    }

    // 🟢 Pagination Logic
    // Page එකක් දීලා නැත්නම් 1 වෙනි පිටුව ගන්නවා. Limit එකක් දීලා නැත්නම් එක පිටුවකට 10 ක් ගන්නවා.
    const pageNumber = parseInt(page as string) || 1;
    const limitNumber = parseInt(limit as string) || 10;
    
    // මඟහැරිය යුතු documents ගණන (Skip)
    const skip = (pageNumber - 1) * limitNumber;

    // මුළු Documents ගණන ලබාගැනීම (Frontend එකේ පිටු ගාණ හදන්න මේක ඕනේ)
    const total = await Category.countDocuments(query);

    // දත්ත ලබාගැනීම
    const categories = await Category.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    res.status(200).json({
      message: "Categories fetched successfully",
      data: categories,
      // 🟢 Frontend එකට යවන Pagination විස්තර
      pagination: {
        total,
        page: pageNumber,
        limit: limitNumber,
        totalPages: Math.ceil(total / limitNumber),
      }
    });
  } catch (err) {
    console.error("getCategories Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// 3. UPDATE - Category එකක් වෙනස් කිරීම
export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    if (name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id } 
      });

      if (existingCategory) {
        return res.status(400).json({ message: "Category name already exists" });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: { name, description } },
      { new: true } 
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

    const newStatus = category.status === CategoryStatus.ACTIVE 
      ? CategoryStatus.INACTIVE 
      : CategoryStatus.ACTIVE;

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

// 5. GET PUBLIC CATEGORIES (Pagination නොමැතිව, Active ඒවා පමණි)
export const getPublicCategories = async (req: Request, res: Response) => {
  try {
    const categories = await Category.find({ status: CategoryStatus.ACTIVE }).sort({ createdAt: -1 });
    res.status(200).json({
      message: "Public categories fetched successfully",
      data: categories,
    });
  } catch (err) {
    console.error("getPublicCategories Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};