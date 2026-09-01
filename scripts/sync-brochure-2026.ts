import { loadEnvFile } from 'node:process';
import mongoose from 'mongoose';
import { Collection, ObjectId } from 'mongodb';

type ContentDocument = {
  _id: ObjectId;
  name?: string;
};

type CanonicalItem = {
  aliases: string[];
  values: Record<string, unknown>;
};

type PlannedUpdate = {
  collection: Collection<ContentDocument>;
  id: ObjectId;
  label: string;
  values: Record<string, unknown>;
};

const committees: CanonicalItem[] = [
  {
    aliases: ['Youth Parliament'],
    values: {
      name: 'YOUTH PARLIAMENT',
      agenda:
        'Reforming the education system to equip students with essential life skills, civic awareness, and career readiness.',
    },
  },
  {
    aliases: ['WHO'],
    values: {
      name: 'WHO',
      agenda:
        'Ensuring equitable access to basic healthcare and disease prevention, especially for children and adolescents.',
    },
  },
  {
    aliases: ['UNGA SOCHUM', 'UNSDG'],
    values: {
      name: 'UNGA SOCHUM',
      agenda:
        'Deliberation on ways to protect the rights of indigenous communities.',
    },
  },
  {
    aliases: ['UNHRC'],
    values: {
      name: 'UNHRC',
      agenda:
        'Preventing the recruitment and use of child soldiers in armed conflicts and ensuring their rehabilitation and reintegration.',
    },
  },
  {
    aliases: ['IP'],
    values: {
      name: 'IP',
      agenda:
        'Analyzing the role of media in shaping public opinion and international diplomacy in the digital age.',
    },
  },
  {
    aliases: ['UNCSW'],
    values: {
      name: 'UNCSW',
      agenda:
        "Condemning the neglect of women's security and autonomy, highlighting issues of violence, exclusion, and exploitation during conflicts and crises.",
    },
  },
  {
    aliases: ['CCC'],
    values: {
      name: 'CCC',
      agenda:
        "Hitler's Invasion of Poland. Freeze Date: 2nd September 1939, 0000 hrs.",
    },
  },
  {
    aliases: ['AIPPM'],
    values: {
      name: 'AIPPM',
      agenda:
        'Deliberation on the implications of the Supreme Court verdict on Electoral Bonds and the future of political funding in India.',
    },
  },
  {
    aliases: ['UNSC'],
    values: {
      name: 'UNSC',
      agenda:
        'Condemning the systematic erosion of global security caused by the misuse of veto power, proxy wars, and the failure of international systems to prevent conflict.',
    },
  },
];

const teamMembers: CanonicalItem[] = [
  {
    aliases: ['Anshika Duggad'],
    values: {
      name: 'Anshika Duggad',
      position: 'Secretary-General',
      type: 'super',
    },
  },
  {
    aliases: ['Aditi Kashid'],
    values: {
      name: 'Aditi Kashid',
      position: 'Deputy Secretary-General',
      type: 'super',
    },
  },
  {
    aliases: ['Srushti Deore', 'Shrushti Deore'],
    values: {
      name: 'Srushti Deore',
      position: 'Director-General',
      type: 'super',
    },
  },
  {
    aliases: ['Viraj Tupe', 'Veeraj Tupe'],
    values: { name: 'Viraj Tupe', position: 'OC Head', type: 'head' },
  },
  {
    aliases: ['Aarohi Deulgaonkar'],
    values: {
      name: 'Aarohi Deulgaonkar',
      position: 'Chief Advisor',
      type: 'head',
    },
  },
  {
    aliases: ['Aarya Kulkarni', 'Arya Kulkarni'],
    values: {
      name: 'Aarya Kulkarni',
      position: 'Administrative Head',
      type: 'head',
    },
  },
];

const festDays: CanonicalItem[] = [
  {
    aliases: ['DESTINIQUE Day 1', 'Destinique Day-01.'],
    values: {
      name: 'DESTINIQUE Day 1',
      date: '7 September 2026',
      price: 500,
      description:
        'Digital Technology and Creative Careers - hands-on activities for future-focused and creative exploration.',
      events: [
        {
          title: 'AI Product Designing / Game Designing',
          description: 'Digital Technology',
        },
        { title: 'Click and Capture', description: 'Digital Technology' },
        { title: 'Content Creation', description: 'Creative Careers' },
        { title: 'Fashion Designing', description: 'Creative Careers' },
        { title: 'Stand-up Comedy', description: 'Creative Careers' },
      ],
    },
  },
  {
    aliases: ['DESTINIQUE Day 2', 'Destinique Day-02.'],
    values: {
      name: 'DESTINIQUE Day 2',
      date: '8 September 2026',
      price: 500,
      description:
        'Intellectual, Music, Dance, and E-Sports activities designed for competition, expression, and collaboration.',
      events: [
        { title: 'Shark Tank', description: 'Intellectual' },
        { title: 'Chess', description: 'Intellectual' },
        { title: 'Rock Riot', description: 'Music' },
        { title: 'Freestyle Rapping', description: 'Music' },
        { title: 'Choreo Craft', description: 'Dance' },
        { title: 'E-Sports', description: 'E-Sports' },
      ],
    },
  },
];

function normalize(value: string | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/\b0+(\d+)\b/g, '$1')
    .replace(/[^a-z0-9]+/g, '');
}

async function planCollection(
  collection: Collection<ContentDocument>,
  items: CanonicalItem[],
): Promise<{ updates: PlannedUpdate[]; archiveIds: ObjectId[] }> {
  const documents = await collection.find({}).toArray();
  const claimedIds = new Set<string>();
  const updates: PlannedUpdate[] = [];

  for (const item of items) {
    const aliases = new Set(item.aliases.map(normalize));
    const match = documents.find(
      (document) =>
        !claimedIds.has(document._id.toHexString()) &&
        aliases.has(normalize(document.name)),
    );

    if (!match) {
      throw new Error(
        `Could not find ${collection.collectionName} entry for ${item.aliases.join(' / ')}`,
      );
    }

    claimedIds.add(match._id.toHexString());
    updates.push({
      collection,
      id: match._id,
      label: String(item.values.name),
      values: { ...item.values, archived: false },
    });
  }

  return {
    updates,
    archiveIds: documents
      .filter((document) => !claimedIds.has(document._id.toHexString()))
      .map((document) => document._id),
  };
}

async function main() {
  try {
    loadEnvFile('.env');
  } catch {
    // Environment variables may already be supplied by the runtime.
  }

  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI is required');
  }

  const apply = process.argv.includes('--apply');
  await mongoose.connect(mongoUri);

  try {
    const database = mongoose.connection.db;
    if (!database) {
      throw new Error('MongoDB connection did not provide a database');
    }

    const plans = await Promise.all([
      planCollection(database.collection('committees'), committees),
      planCollection(database.collection('teammembers'), teamMembers),
      planCollection(database.collection('festdays'), festDays),
    ]);

    const updates = plans.flatMap((plan) => plan.updates);
    const archives = plans.map((plan) => plan.archiveIds);

    console.log(
      apply
        ? 'Applying RJMUN 2026 brochure content.'
        : 'Dry run only. Pass --apply to write changes.',
    );
    for (const update of updates) {
      console.log(`- ${update.collection.collectionName}: ${update.label}`);
    }
    console.log(`- committees archived: ${archives[0].length}`);
    console.log(`- team members archived: ${archives[1].length}`);
    console.log(`- fest days archived: ${archives[2].length}`);
    console.log('- fest multi-day discounts: none');

    if (!apply) {
      return;
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const update of updates) {
          await update.collection.updateOne(
            { _id: update.id },
            { $set: update.values },
            { session },
          );
        }

        const collections = [
          database.collection<ContentDocument>('committees'),
          database.collection<ContentDocument>('teammembers'),
          database.collection<ContentDocument>('festdays'),
        ];
        for (let index = 0; index < collections.length; index += 1) {
          if (archives[index].length > 0) {
            await collections[index].updateMany(
              { _id: { $in: archives[index] } },
              { $set: { archived: true } },
              { session },
            );
          }
        }

        await database
          .collection('festoffers')
          .updateOne(
            {},
            { $set: { discounts: {} } },
            { upsert: true, session },
          );
      });
    } finally {
      await session.endSession();
    }

    console.log('Brochure content synchronized successfully.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Brochure synchronization failed: ${message}`);
  process.exitCode = 1;
});
