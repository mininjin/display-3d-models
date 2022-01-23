import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Object3D } from "three/src/Three";
export default async function fileLoader(file: File): Promise<Object3D | null> {
  const extension = file.name.split(".").slice(-1)[0];
  const dataURL = URL.createObjectURL(file);
  switch (extension) {
    case "fbx": {
      const loader = new FBXLoader();
      return await loader.loadAsync(dataURL);
    }
    case "dae": {
      const loader = new ColladaLoader();
      const collada = await loader.loadAsync(dataURL);
      return collada.scene;
    }
    case "glb":
    case "gltf": {
      const loader = new GLTFLoader();
      const gltf = await loader.loadAsync(dataURL);
      return gltf.scene;
    }
    case "obj": {
      const loader = new OBJLoader();
      return await loader.loadAsync(dataURL);
    }
    default:
      console.log("Not supported file extension: " + extension);
      return null;
  }
}
