This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
git clone https://github.com/jaskaranpreets7/takehome-freed.git
cd takehome-freed
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Approach

I used cursor IDE to auto generate my code
I added the spec.md file basically to architect the layout of compnents and packages and tech stack needed
e.g

1.  used react query (to fetch the data can cache the data )
2.  Added fallback UI to show empty results instead of error for better UX experience

I basically use bottom up approach to build the dashboard and details page for the drugs, as i don't have prior knowledge about medical domain due to that i showed most of the information from the apis .

If i have more time

1. I shoud refactor the types of the payload and use mmost important inform e,g Manufacturing, Widget
2. Widget component not showing the data, need some time to debug, maybe i need to make a extra call to get the time series data for the chart
