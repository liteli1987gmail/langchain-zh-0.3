import React, { useEffect } from "react";
import { useHistory } from "@docusaurus/router";
import useBaseUrl from "@docusaurus/useBaseUrl";
import Layout from "@theme/Layout";

export default function Home() {
  const history = useHistory();
  const redirectUrl = useBaseUrl("/docs/introduction/");

  useEffect(() => {
    const timer = setTimeout(() => {
      history.push(redirectUrl);
    }, 1000); // 3000毫秒（3秒）后跳转

    return () => clearTimeout(timer);
  }, [history, redirectUrl]);

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
          fontSize: '20px',
        }}>
      </div>
    </Layout>
  );
}