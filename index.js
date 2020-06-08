const status = {
  pending: "pending",
  fulfilled: "fulfilled",
  rejected: "rejected",
};

function myPromise(exector) {
  const vm = this;
  this.value = null;
  this.reason = null;
  this.status = status.pending;
  this.resolvedCallbacks = [];
  this.rejectedCallbacks = [];

  // success
  function resolve(value) {
    if (vm.status === status.pending) {
      vm.value = value;
      vm.status = status.fulfilled;
      vm.resolvedCallbacks.forEach((fn) => fn());
    }
  }

  // fail
  function reject(reason) {
    if (vm.status === status.pending) {
      vm.reason = reason;
      vm.status = status.reject;
      vm.rejectedCallbacks.forEach((fn) => fn());
    }
  }

  // error handling
  try {
    exector(resolve, reject);
  } catch (error) {
    reject(error);
  }
}

// function myPromise(exector) {
//   const vm = this;
//   this.value = null;
//   this.reason = null;
//   this.status = status.pending;
//   this.resolvedCallbacks = [];
//   this.rejectedCallbacks = [];

//   // success
//   function resolve(value) {
//     if (vm.status === status.pending) {
//       vm.value = value;
//       vm.status = status.resolve;
//       vm.resolvedCallbacks.forEach((fn) => fn());
//     }
//   }

//   // fail
//   function reject(reason) {
//     if (vm.status === status.pending) {
//       vm.reason = reason;
//       vm.status = status.reject;
//       vm.rejectedCallbacks.forEach((fn) => fn());
//     }
//   }

//   // error
//   try {
//     exector(resolve, reject);
//   } catch (error) {
//     reject(error);
//   }
// }

myPromise.prototype.then = function (onFulfilled, onRejected) {
  const vm = this;
  if (this.status === status.fulfilled) {
    onFulfilled(vm.value);
  }

  if (this.status === status.rejected) {
    onRejected(vm.reason);
  }

  if (this.status === status.pending) {
    // store callbacks
    this.resolvedCallbacks.push(() => {
      onFulfilled(vm.value);
    });

    this.rejectedCallbacks.push(() => {
      onRejected(vm.reason);
    });
  }
};

const test = new myPromise((resolve, reject) => {
  setTimeout(() => {
    const guess = Math.random() * 100;
    if (guess > 50) {
      resolve(guess);
    } else {
      reject(guess);
    }
  });
});

test.then(
  (result) => {
    console.log(`success:${result}`);
  },
  (error) => {
    console.log(`error:${error}`);
  }
);

// myPromise.prototype.then = function (onFulfilled, onRejected) {
//   const vm = this;

//   ///
//   function resolvePromise(promise2, x, resolve, reject) {
//     // promise2和函数执行后返回的结果是同一个对象

//     if (promise2 === x) {
//       return reject(new TypeError("Chaining cycle"));
//     }
//     let called;
//     // x可能是一个promise 或者是一个普通值
//     if (x !== null && (typeof x === "object" || typeof x === "function")) {
//       try {
//         let then = x.then; // 取对象上的属性 怎么能报异常呢？(这个promise不一定是自己写的 可能是别人写的 有的人会乱写)
//         // x可能还是一个promise 那么就让这个promise执行即可
//         // {then:{}}
//         // 这里的逻辑不单单是自己的 还有别人的 别人的promise 可能既会调用成功 也会调用失败
//         if (typeof then === "function") {
//           then.call(
//             x,
//             (y) => {
//               // 返回promise后的成功结果
//               // 递归直到解析成普通值为止
//               if (called) return; // 防止多次调用
//               called = true;
//               // 递归 可能成功后的结果是一个promise 那就要循环的去解析
//               resolvePromise(promise2, y, resolve, reject);
//             },
//             (err) => {
//               // promise的失败结果
//               if (called) return;
//               called = true;
//               reject(err);
//             }
//           );
//         } else {
//           resolve(x);
//         }
//       } catch (e) {
//         if (called) return;
//         called = true;
//         reject(e);
//       }
//     } else {
//       // 如果x是一个常量
//       resolve(x);
//     }
//   }

//   ///

//   const promise2 = new myPromise((resolve, reject) => {
//     if (this.status === status.resolved) {
//       //获取回调的返回值
//       try {
//         // 当执行成功回调的时候 可能会出现异常，那就用这个异常作为promise2的错误的结果
//         let x = onFulfilled(vm.value);
//         //执行完当前成功回调后返回结果可能是promise
//         resolvePromise(promise2, x, resolve, reject);
//       } catch (e) {
//         reject(e);
//       }
//     }

//     if (this.status === status.rejected) {
//       //获取回调的返回值
//       try {
//         let x = onRejected(vm.reason);
//         resolvePromise(promise2, x, resolve, reject);
//       } catch (e) {
//         reject(e);
//       }
//     }

//     // 如果异步执行则位pending状态
//     if (this.status === status.pending) {
//       // 保存回调函数
//       this.resolvedCallbacks.push(() => {
//         //获取回调的返回值
//         try {
//           let x = onFulfilled(vm.value);
//           resolvePromise(promise2, x, resolve, reject);
//         } catch (e) {
//           reject(e);
//         }
//       });

//       this.rejectedCallbacks.push(() => {
//         //获取回调的返回值
//         try {
//           let x = onRejected(vm.reason);
//           resolvePromise(promise2, x, resolve, reject);
//         } catch (e) {
//           reject(e);
//         }
//       });
//     }
//   });

//   return promise2;
// };

////////

// let promise = new myPromise((resolve, reject) => {
//   setTimeout(() => {
//     if (Math.random() > 0.5) {
//       resolve("成功");
//     } else {
//       reject("失败");
//     }
//   });
// });

// promise.then(
//   (data) => {
//     console.log("success" + data);
//   },
//   (err) => {
//     console.log("err" + err);
//   }
// );
