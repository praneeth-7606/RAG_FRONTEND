// import './globals.css'
// import 'bootstrap/dist/css/bootstrap.min.css'
// import 'antd/dist/reset.css'

// export const metadata = {
//   title: 'InsureRAG - Insurance Policy AI Assistant',
//   description: 'AI-powered insurance policy analysis and Q&A system',
// }

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body suppressHydrationWarning={true}>
//         {children}
//       </body>
//     </html>
//   )
// }


import RootComponent from '@/components/rootcomponent'
// import RootComponent from '../components/RootComponent'
import './globals.css'

export const metadata = {
  title: 'InsureRAG - Insurance Policy AI Assistant',
  description: 'AI-powered insurance policy analysis and Q&A system',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1e40af" />
      </head>
      <body suppressHydrationWarning={true}>
        <RootComponent>
          {children}
        </RootComponent>
      </body>
    </html>
  )
}