import React from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import TocExtraContent from '@site/src/components/TocExtraContent';

export default function DocItemLayoutWrapper(props) {
  return (
    <>
      <DocItemLayout {...props} />
      <TocExtraContent />
    </>
  );
}