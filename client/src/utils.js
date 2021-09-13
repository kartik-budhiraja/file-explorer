export const transformBaseDir = (res, data) => {
  const path = Object.keys(res)?.[0];
  const parentKey = `0-${data.filter((node) => node.isTop)?.length}`;
  const parentNode = {
    key: parentKey,
    title: path,
    isLeaf: false,
    path,
    isTop: true,
  };

  const children = res[path]?.map((node, index) => ({
    ...node,
    key: `${parentKey}-${index}`,
    title: node.name,
    isLeaf: !node.isDirectory,
  }));
  return [{ ...parentNode, children }];
};

export const transformChildren = (children, parent) =>
  children.map((child, index) => ({
    ...child,
    key: `${parent.key}-${index}`,
    title: child.name,
    isLeaf: !child.isDirectory,
  }));

export const isChildOf = (child, parent) => {
  if (child === parent) return false;
  const parentTokens = parent.split("/").filter((i) => i.length);
  const childTokens = child.split("/").filter((i) => i.length);
  return parentTokens.every((t, i) => childTokens[i] === t);
};

export const findNode = (path, data) => {
  let node = null;

  if (data.isLeaf) {
    return node;
  }

  const { children } = data;
  if (data.path === path) {
    node = data;
  } else if (Array.isArray(children)) {
    children.forEach((child) => {
      if (!node) {
        node = findNode(path, child);
      }
    });
  }
  return node;
};

export const deleteChild = (parent, node) => {
  parent.children = parent.children.filter((child) => child.path !== node.path);
};

export const addChild = (parent, node) => {
  const { children } = parent;
  parent.children = [
    ...((Array.isArray(children) && children) || []).filter(
      (child) => node.path !== child.path
    ),
    {
      ...node,
      key: `${parent.key}-${parent?.children?.length || 0}`,
      title: node.name,
      isLeaf: !node.isDirectory,
    },
  ];
};
