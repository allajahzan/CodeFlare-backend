/**
 * Handles notification request.
 * @param {Object} call - gRPC call object with request data.
 * @param {function} callback - Callback function with response data.
 * @returns {Object} response - Response object with status and message.
 */
export const getUser = async (call: any, callback: any) => {
    try {
        const { id } = call.request

        console.log(id)
        
    } catch (err) {
        console.log(err)
        callback(null, { status: 403, msg: 'not valid request' })
    }
}