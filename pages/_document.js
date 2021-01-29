import Document, { Html, Head, Main, NextScript } from "next/document";
import icon from "../public/favicon.ico";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="pt-br">
        <Head>
          <meta httpEquiv="Content-Language" content="pt-br" />
          <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
          <link rel="shortcut icon" href={icon} type="image/x-icon" />
          <link rel="icon" href={icon} type="image/x-icon" />
          <meta name="author" content="Victor de Andrade"></meta>
          <meta
            name="description"
            content="o Bora Pas é uma plataforma de preparação para o Programa de Avaliação Seriada da unb (pas), onde você acumula pontos e compartlha seu progresso rumo à UNB"
          ></meta>
          <meta
            name="keywords"
            content="unb, pas, vestibular, educação, plataforma, ação, bora, estudar, pontos, ranking, brasília, universidade de brasília"
          ></meta>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
