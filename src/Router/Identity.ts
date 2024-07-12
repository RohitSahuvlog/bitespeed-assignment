import { Router, Request, Response } from 'express';
import Contact from '../model/contact';

const router = Router();

interface IdentifyRequestBody {
  email?: string;
  phoneNumber?: string;
}

interface IdentifyResponse {
  contact: {
    primaryContactId: string;
    emails: string[];
    phoneNumbers: string[];
    secondaryContactIds: string[];
  };
}

router.post('/identify', async (req: Request, res: Response) => {
  const { email, phoneNumber }: IdentifyRequestBody = req.body;

  try {
    const existingContacts = await Contact.find({
      $or: [{ phoneNumber }, { email }],
      deletedAt: null,
    }).sort({ createdAt: 1 });

    let primaryContact = existingContacts[0];
    const secondaryContacts: string[] = [];

    if (!primaryContact) {
      primaryContact = new Contact({ email, phoneNumber });
      await primaryContact.save();
    } else {
      for (let i = 1; i < existingContacts.length; i++) {
        const secondaryContact = existingContacts[i];
        secondaryContacts.push((secondaryContact._id as string).toString());
        await Contact.updateOne(
          { _id: secondaryContact._id },
          { $set: { linkPrecedence: 'secondary', linkedId: primaryContact._id, updatedAt: new Date() } }
        );
      }

      const newInfoExists = (
        (email && !existingContacts.some(contact => contact.email === email)) ||
        (phoneNumber && !existingContacts.some(contact => contact.phoneNumber === phoneNumber))
      );

      if (newInfoExists) {
        const newContact = new Contact({
          email,
          phoneNumber,
          linkPrecedence: 'secondary',
          linkedId: primaryContact._id,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        await newContact.save();
        secondaryContacts.push((newContact._id as string).toString());
      }
    }

    const response: IdentifyResponse = {
      contact: {
        primaryContactId: (primaryContact._id as string).toString(),
        emails: Array.from(new Set([...existingContacts.map(contact => contact.email || ''), primaryContact.email].filter(Boolean))) as string[],
        phoneNumbers: Array.from(new Set([primaryContact.phoneNumber, ...existingContacts.map(contact => contact.phoneNumber).filter(Boolean)])) as string[],
        secondaryContactIds: secondaryContacts,
      },
    };

    res.status(200).json(response);
  } catch (err) {
    console.error('Error handling /identify request:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
