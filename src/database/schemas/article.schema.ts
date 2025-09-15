import { RxJsonSchema } from 'rxdb';

export const articleSchema: RxJsonSchema<any> = {
  version: 0,
  title: 'Article Schema',
  description: 'Schema for Article collection',
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
    qty: {
      type: 'number',
      minimum: 0,
      multipleOf: 1,
    },
    selling_price: {
      type: 'number',
      minimum: 0,
      multipleOf: 0.01,
    },
    business_id: {
      type: 'string',
      ref: 'businesses',
      maxLength: 100,
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
  required: [
    'id',
    'name',
    'qty',
    'selling_price',
    'business_id',
    'createdAt',
    'updatedAt',
  ],
} as const;

// Document methods - export properly
export const articleDocumentMethods = {
  getTotalValue(this: any): number {
    return this.qty * this.selling_price;
  },

  isInStock(this: any): boolean {
    return this.qty > 0;
  },
};

// Collection methods - export properly
export const articleCollectionMethods = {
  async findByBusiness(this: any, businessId: string) {
    return this.find({
      selector: {
        business_id: businessId,
      },
    }).exec();
  },

  async getBusinessInventoryValue(
    this: any,
    businessId: string,
  ): Promise<number> {
    const articles = await this.findByBusiness(businessId);
    return articles.reduce((total: number, article: any) => {
      return total + article.qty * article.selling_price;
    }, 0);
  },
};
