import * as z from 'zod'

export function GetClientSchema() {
  const ObjectSharedFields = z.object({
    product: z.string({ required_error: 'Product Name is required' }),
    price: z.string({ required_error: 'Price is required' }),
  })

  return ObjectSharedFields
}
