// Runs the scripted match for a seed in a fresh process and prints its fingerprint.
import { fingerprint, runScripted } from '../helpers';

const seed = Number(process.argv[2]);
process.stdout.write(fingerprint(runScripted(seed).m));
