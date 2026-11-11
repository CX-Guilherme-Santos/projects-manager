# Base for service objects: `SomeService.call(...)` returns a Result.
#
#   result = Projects::CreateService.call(attributes: { name: "Projeto Iridium", ... })
#   result.success? # => true / false
#   result.record   # => the Project (with errors when it failed)
class ApplicationService
  Result = Data.define(:success, :record) do
    def success? = success
    def failure? = !success
  end

  def self.call(...) = new(...).call

  private

  def success(record) = Result.new(success: true, record: record)
  def failure(record) = Result.new(success: false, record: record)
end
