import { Contact } from "../Model/contact.js";

export const saveContact = async (req, res) => {
  try {
    const { email, name, message } = req.body;
    const newContact = new Contact({ email, name, message });
    await newContact.save();
    res.status(200).send({ message: "Contact saved successfully!" });
  } catch (error) {
    res
      .status(500)
      .send({ message: "An error occurred while saving the contact." });
  }
};
