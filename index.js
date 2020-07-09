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

myPromise.prototype.then = function (onFulfilled, onRejected) {
  // check the type of onFulfilled, onRejected
  onFulfilled =
    typeof onFulfilled === "function" ? onFulfilled : (value) => value;
  onRejected =
    typeof onRejected === "function"
      ? onRejected
      : (error) => {
          throw error;
        };
  const vm = this;

  function resolvePromise(current, returned, resolve, reject) {
    // check if current === origin
    if (current === returned) {
      console.log("Chaining cycle!");
      return reject(new TypeError("Chaining cycle!"));
    }

    let isCalled;
    // 2.3.3. Otherwise, if x is an object or function
    // 2.3.4. If x is not an object or function, fulfill promise with x
    if (
      returned !== null &&
      (typeof returned === "object" || typeof returned === "function")
    ) {
      try {
        // 2.3.3.1 Let then be x.then
        // 2.3.3.2 If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason.
        const then = returned.then;
        // 2.3.3.3 If then is a function, call it with x as this, first argument resolvePromise, and second argument rejectPromise
        if (typeof then === "function") {
          then.call(
            returned,
            // resolve
            (returnedAgain) => {
              // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
              if (isCalled) return;
              isCalled = true;
              // Recursive until returned is not a promise
              resolvePromise(returned, returnedAgain, resolve, reject);
            },
            // reject
            (error) => {
              // 2.3.3.3.3 If both resolvePromise and rejectPromise are called, or multiple calls to the same argument are made, the first call takes precedence, and any further calls are ignored.
              if (isCalled) return;
              isCalled = true;
              reject(error);
            }
          );
        } else {
          resolve(returned);
        }
      } catch (error) {
        // 2.3.3.3.4.1 If resolvePromise or rejectPromise have been called, ignore it.
        if (isCalled) return;
        isCalled = true;
        reject(error);
      }
    } else {
      resolve(returned);
    }
  }

  const promiseNew = new myPromise((resolve, reject) => {
    if (this.status === status.fulfilled) {
      setTimeout(() => {
        try {
          const origin = onFulfilled(vm.value);
          resolvePromise(promiseNew, origin, resolve, reject);
        } catch (error) {
          reject(error);
        }
      }, 0);
    }

    if (this.status === status.rejected) {
      setTimeout(() => {
        try {
          const origin = onRejected(vm.reason);
          resolvePromise(promiseNew, origin, resolve, reject);
        } catch (error) {
          reject(error);
        }
      });
    }

    if (this.status === status.pending) {
      // store callbacks
      this.resolvedCallbacks.push(() => {
        setTimeout(() => {
          try {
            const origin = onFulfilled(vm.value);
            resolvePromise(promiseNew, origin, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });

      this.rejectedCallbacks.push(() => {
        setTimeout(() => {
          try {
            const origin = onRejected(vm.reason);
            resolvePromise(promiseNew, origin, resolve, reject);
          } catch (error) {
            reject(error);
          }
        });
      });
    }
  });

  return promiseNew;
};

myPromise.prototype.catch = function (onRejected) {
  return this.then(null, onRejected);
};

myPromise.resolve = function (value) {
  return new myPromise((resolve, reject) => {
    resolve(value);
  });
};
myPromise.reject = function (reason) {
  return new myPromise((resolve, reject) => {
    reject(reason);
  });
};

myPromise.race = function (promiseArray) {
  return new myPromise((resolve, reject) => {
    for (let i = 0; i < promiseArray.length; i += 1) {
      promiseArray[i].then(resolve, reject);
    }
  });
};

myPromise.all = function (promiseArray) {
  return new myPromise((resolve, reject) => {
    const result = [];
    let count = 0;

    for (let i = 0; i < promiseArray.length; i += 1) {
      promiseArray[i].then((data) => {
        result[i] = data;
        if (promiseArray.length === ++count) {
          resolve(result);
        }
      }, reject);
    }
  });
};

const test1 = new myPromise((resolve, reject) => {
  setTimeout(() => {
    const guess1 = Math.random() - 0.5;
    if (guess1 > 0) {
      resolve(guess1);
    } else {
      reject(guess1);
    }
  });
});

const test = new myPromise((resolve, reject) => {
  setTimeout(() => {
    resolve(test1);
  });
});

test
  .then()
  .then(
    (result) => {
      console.log(`success:${result}`);
      console.log("then1");
      return result;
    },
    (error) => {
      console.log(`error:${error}`);
      return `error:${error}`;
    }
  )
  .then()
  .then(function (result) {
    if (result != undefined && result != "") console.log("get the data");
    console.log(result);
  });

myPromise.deferred = function () {
  let defer = {};
  defer.promise = new myPromise((resolve, reject) => {
    defer.resolve = resolve;
    defer.reject = reject;
  });
  return defer;
};
module.exports = myPromise;
