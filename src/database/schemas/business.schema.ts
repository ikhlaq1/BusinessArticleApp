import { RxJsonSchema } from 'rxdb';

export const businessSchema: RxJsonSchema<any> = {
  version: 0,
  title: 'Business Schema',
  description: 'Schema for Business collection',
  primaryKey: 'id',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      maxLength: 100,
    },
    name: {
      type: 'string',
      minLength: 1,
      maxLength: 200,
    },
    createdAt: {
      type: 'number',
      minimum: 0,
    },
    updatedAt: {
      type: 'number',
      minimum: 0,
    },
  },
  required: ['id', 'name', 'createdAt', 'updatedAt'],
};

// Collection methods - export properly
export const businessDocumentMethods = {
  getDisplayName(this: any): string {
    return this.name.toUpperCase();
  },
};

export const businessCollectionMethods = {
  async countAll(this: any): Promise<number> {
    const allDocs = await this.find().exec();
    return allDocs.length;
  },
};
