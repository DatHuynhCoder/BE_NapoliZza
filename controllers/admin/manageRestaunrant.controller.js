import cloudinary from "../../config/cloudinary.js";
import { Restaurant } from "../../models/restaurant.model.js";
import { deleteTempFiles } from "../../utils/deleteTempFiles.js";

export const createRestaurant = async (req, res) => {
  try {
    const name = req.body.name;

    //Check if the restaurant name already exists
    const existingRestaurant = await Restaurant.findOne({ name });
    if (existingRestaurant) {
      return res.status(400).json({ success: false, message: "Restaurant name already exists" });
    }

    //Parse opening hours from request body ERROR
    let openingHours = [];
    if (req.body.openingHours) {
      try {
        openingHours = typeof req.body.openingHours === 'string' ? JSON.parse(req.body.openingHours) : req.body.openingHours;

        //Validate opening hours format
        if (!Array.isArray(openingHours) || openingHours.some(hour => !hour.day || !hour.timeOpen || !hour.timeClose)) {
          return res.status(400).json({ success: false, message: "Invalid opening hours format" });
        }

        //Push data to opening hours array
        openingHours = openingHours.map(hour => ({
          day: hour.day,
          timeOpen: hour.timeOpen,
          timeClose: hour.timeClose
        }));

      } catch (error) {
        res.status(400).json({ success: false, message: "Invalid opening hours format" });
      }
    }

    //Upload image to cloudinary
    const resFile = req.file;
    let resImg = null;
    if (resFile) {
      const uploadedResImg = await cloudinary.uploader.upload(resFile.path, {
        folder: "NapoliZza/Restaurant",
        transformation: [
          { width: 800, height: 800, crop: "limit" },
          { quality: "auto" },
          { fetch_format: "auto" }
        ]
      });
      resImg = {
        url: uploadedResImg.secure_url,
        public_id: uploadedResImg.public_id
      };
      //delete temp file
      deleteTempFiles([resFile]);
    }

    //Create new restaurant
    const newRestaunrant = await Restaurant.create({
      name: name,
      profit: 0,
      quantitySold: 0,
      phone: req.body.phone,
      starQuality: req.body.starQuality,
      status: "active",
      description: req.body.description,
      resImg: resImg,
      address: {
        street: req.body.street,
        city: req.body.city,
        borough: req.body.borough,
        zip: req.body.zip
      },
      openingHours: openingHours
    });

    res.status(201).json({ success: true, data: newRestaunrant });

  } catch (error) {
    console.error("Error in create restaurant: ", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}