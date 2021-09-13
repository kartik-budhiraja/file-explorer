import "antd/dist/antd.css";
import "./App.css";
import { useReducer, useRef } from "react";
import { Tree as AntTree } from "antd";
import {
  transformBaseDir,
  transformChildren,
  isChildOf,
  findNode,
  deleteChild,
  addChild,
} from "./utils";
import useSocket from "./useSocket";

const DELETE_TYPES = ["unlink", "unlinkDir"];
const ADD_TYPES = ["add", "addDir"];

const Tree = () => {
  const data = useRef([]);
  // eslint-disable-next-line no-unused-vars
  const [_, forceReload] = useReducer((v) => v + 1, 0);

  const addBaseDir = (res) => {
    data.current = [...data.current, ...transformBaseDir(res, data.current)];
    forceReload();
  };

  const addChildren = (nodes) => {
    if (!Object.keys(nodes).length) {
      return;
    }
    const parentPath = Object.keys(nodes)[0];
    let isUpdated = false;
    const tree = [...data.current];
    tree.forEach((dir, index) => {
      if (isChildOf(parentPath, dir.path) && !isUpdated) {
        const parent = findNode(parentPath, tree[index]);
        if (parent) {
          const { children } = parent;
          parent.children = ((Array.isArray(children) && children) || [])
            .filter((child) =>
              nodes[parentPath].every((node) => node.path !== child.path)
            )
            .concat(transformChildren(nodes[parentPath], parent));
          data.current = tree;
          isUpdated = true;
          forceReload();
        }
      }
    });
  };

  const handleChange = (change) => {
    if (ADD_TYPES.includes(change.type)) {
      const parentPath = change.parent;
      let isUpdated = false;
      const tree = [...data.current];
      tree.forEach((parent, index) => {
        if (isChildOf(change.path, parent.path) && !isUpdated) {
          const parent = findNode(parentPath, tree[index]);
          if (parent) {
            addChild(parent, change);
            data.current = tree;
            isUpdated = true;
            forceReload();
          }
        }
      });
    } else if (DELETE_TYPES.includes(change.type)) {
      const parentPath = change.parent;
      let isUpdated = false;
      const tree = [...data.current];
      tree.forEach((parent, index) => {
        if (isChildOf(change.path, parent.path) && !isUpdated) {
          const parent = findNode(parentPath, tree[index]);
          if (parent && parent.children) {
            deleteChild(parent, change);
            data.current = tree;
            isUpdated = true;
            forceReload();
          }
        }
      });
    }
  };

  // eslint-disable-next-line no-use-before-define
  const socket = useSocket(addBaseDir, addChildren, handleChange);

  const onLoadData = ({ key, children, path }) =>
    new Promise((resolve) => {
      if (children) {
        resolve();
        return;
      }
      socket.emit("Get Children", path);
      resolve();
    });

  const onExpand = (key, { node, expanded }) => {
    // Only load data again if children are present
    // This is to cover an edge case where
    // some children were loaded due to a change in them
    // but rest were never loaded
    if (expanded && node.children) {
      socket.emit("Get Children", node.path);
      forceReload();
    }
  };

  return (
    <div className="App">
      <AntTree
        treeData={data.current}
        loadData={onLoadData}
        onExpand={onExpand}
      />
    </div>
  );
};

export default Tree;
