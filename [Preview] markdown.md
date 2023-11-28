# Next.js 14

## Server actions - czyli ciekawostka z gatunku przyrodniczych

### NFU wyjaśnia - najpierw może trochę teorii

Next.js udostępnia programistom fajne techniki pobierania danych. Jedną z technik jest użycie server actions. Akcje serwerowe są oparte na akcjach React, które można definiować w komponentach serwerowych i/lub wywoływać z komponentów klienckich. Akcje serwera to asynchroniczne funkcje JavaScript uruchamiane na serwerze przez interakcje użytkownika na kliencie.

### Jak używać Server Actions?

W komponentach serwerowych:

```
export default function OrderProducts() {
  async function addProductToOrder(product, orderId) {
    'use server'

     await saveProduct({product, orderId});
  }

  return(
     <form action={addProductToOrder}>
       <button type="submit">Add Product</button>
     </form>
  )
}
```

w komponentach klienckich:

```
'use server'

import { addProductToOrder } from '@/data/order'

export async function addProduct(data, orderId) {
  const response = await addProductToOrder(data, orderId);
  return response;
}
```

### Po co te całe Server Actions?

Dzięki Server Actions nie trzeba ręcznie tworzyć endpointów API. Zamiast tego definiuje się asynchroniczne funkcje serwera, które można wywoływać bezpośrednio z komponentów. W skrócie pozwalają zaoszczędzić mnóstwo cennego czasu na budowie funkcjonalności pobierania i wyświetlania danych.
Zainteresowanych szczegółami odsyłamy do [dokumentacji](https://nextjs.org/docs/app/building-your-application/data-fetching/forms-and-mutations).

### No to pora na jakiś przykład

Załóżmy, że pracujemy nad najbardziej powszechnym problemem dodawania i wyświetlania dodanych produktów. Mamy do stworzenia formularz dodawania produktów oraz sekcję istniejących produktów. Zacznijmy więc od formularza:

```
  <h1 className='text-3xl font-bold text-center'>Products Warehouse</h1>
    <form
      action={''}
      className='flex flex-col gap-5 max-w-xl mx-auto p-5'
    >
      <input
        name='product'
        placeholder='Enter Product name...'
        className='border border-e-gray-300 p-2 rounded-md'
        ></input>
      <input
        name='price'
        placeholder='Enter Price name...'
        className='border border-e-gray-300 p-2 rounded-md'
        ></input>
      <button
        type='submit'
        className='border bg-blue-500 text-white p-2 rounded-md'
      >
        Add Product
      </button>
    </form>
```

Formularz prezentuje się następująco:

![form](/post-app/public/form.png 'form')

Na potrzeby tego przykładu skorzystamy z [Mockapi](https://mockapi.io/). Zróbmy schemat składający się z 3 pól: id, products i price:

![Generate schema](/post-app/public/create-schema.png 'Schema')

następnie wygenerujmy dowolną ilość danych:

![Generate data](/post-app/public/generate.png 'data')

Skro mamy gotowe dane pora je wyświetlić. Potrzebny nam będzie do tego interfejs reprezentujący pola danych, funkcja pobierająca dane poprzez API,
oraz mechanizm przerabiający otrzmany json na ciągi znaków i wyświetlający je użytkownikowi. Nie zapomnijmy o zmianie serwerowego komponentu na asynchroniczny!

```
export interface Product {
  id?: number
  product: string
  price: string
}

export default async function Home() {
  const res = await fetch(
    'https://6565bfe0eb8bb4b70ef24984.mockapi.io/products',
    {
      cache: 'no-cache',
      next: {
        tags: ['products'],
      },
    }
  )
  const products: Product[] = await res.json()
  return (
  .
  .
  .
  </form>

  <h2 className='font-bold p-5 text-center mx-auto'>
  List of Products
  </h2>

  <div className='flex flex-wrap gap-5 max-w-xl mx-auto'>
    {products.map((product) => (
      <div key={product.id} className='p-5 shadow'>
        <p>{product.product}</p>
        <p>${product.price}</p>
      </div>
    ))}
  </div>
```

Po odświerzeniu strony powinniśmy zobaczyć pobrane dane:

![data](/post-app/public/list-data.png 'data-list')

Skoto mamy już możliość podejrzenia danych napiszmy mechanizm tworzący nową pozycję na liście. Tutaj pojawiają się właśnie Server Acions.

```
const addProductsToDatabase = async (e: FormData) => {
    'use server'
    const product = e.get('product')?.toString()
    const price = e.get('price')?.toString()

    if (!product || !price) return

    const newProduct: Product = {
      product,
      price,
    }
    await fetch('https://6565bfe0eb8bb4b70ef24984.mockapi.io/products', {
      method: 'POST',
      body: JSON.stringify(newProduct),
      headers: {
        'Content-Type': 'application/json',
      },
    })
    revalidateTag('products')
  }
```

następnie w akcji formularza:

```
<form action={addProductsToDatabase} className='flex flex-col gap-5 max-w-xl mx-auto p-5'>
```

Co się tutaj zadziało? Adnotacja `'use server'` sugeruje, że jest to akcja serwera. W tym niewielkim kawałku kodu przechwycamy dane z formularza a nastęnie metodą POST wysłamy na adres API. Zatwierdzając formularz wykonaliśmy na serwerze asynchroniczą funkcję `addProductsToDatabase`, która przetwarza dane przy pomocy interfejsu `FormData` a następnie ustawia na ich podstawie elementy requestu. Dynamiczne odświeżenie listy produktów zawdzięczamy metodzie `revalidateTag`.

Teraz po wypełnieniu formularza mamy szybką odpowiedź w postaci zaaktualizowanej listy produktów:

![final-list](/post-app/public/final-list.png 'final-list')

### Co z tego wynika?

Warto stosować Server actions, w dużo którszym czasie mamy zaimplementowane funkcje zastępujące endpoity. Jest to mechanizm wydajny zarówno pod względem czasu implementacji jak i również czasu wykonania. Należy się łapka w górę Dobra robota Vercel jak chcecie to umiecie :)
