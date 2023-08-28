import React, { FC, Fragment } from 'react';

export type YotpoScriptsProps = {};

export type HtmlScript = {
  defer?: boolean;
  async?: boolean;
  src: string;
  type: string;
};

const YOTPO_SCRIPTS: HtmlScript[] = [
  {
    src: `//cdn-widgetsrepository.yotpo.com/v1/loader/${process.env.YOTPO_API_KEY}`,
    type: 'text/javascript',
    async: true,
    defer: true
  }
];

/**
 * Embeds the Yotpo widget script into the dom
 */
const YotpoScripts: FC<YotpoScriptsProps> = () => {
  return (
    <Fragment>
      {YOTPO_SCRIPTS.map((script) => (
        <script
          key={script.src}
          src={script.src}
          async={script.async}
          defer={script.defer}
          type={script.type}
        ></script>
      ))}
    </Fragment>
  );
};

export default YotpoScripts;
