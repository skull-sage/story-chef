/**
 * Created by prevy-sage on 10/3/18.
 */
import { Notify } from 'quasar';


const QNotify = {
  positive(msg$) {
    Notify.create({ message: msg$, type: 'positive' });
  },
  negative(msg$) {
    Notify.create({ message: msg$, color: 'red-7' }); // default is red
  }
};


export default QNotify;
