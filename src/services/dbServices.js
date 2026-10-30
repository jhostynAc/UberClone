import { collection,doc,setDoc,getDoc,getDocs,updateDoc,deleteDoc,query,orderBy } from 'firebase/firestore'
import {db} from '../config/firebaseConfig';

const COLLECTION = "PersonInfo";


