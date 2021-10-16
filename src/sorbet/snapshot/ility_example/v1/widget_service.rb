# This code was generated by a tool.
# ility@0.0.3
#
# Changes to this file may cause incorrect behavior and will be lost if
# the code is regenerated.

# typed: strict

require 'typed_struct_helper'

module IlityExample::V1::WidgetService
  extend T::Sig
  extend T::Helpers

  interface!

  sig do
    abstract.returns(IlityExample::V1::Widget)
  end
  def get_widgets
  end

  sig do
    abstract.params(body: T.nilable(IlityExample::V1::CreateWidgetBody)).
      void
  end
  def create_widget(body: nil)
  end

  sig do
    abstract.void
  end
  def put_widget
  end

  sig do
    abstract.params(id: String).
      returns(IlityExample::V1::Widget)
  end
  def get_widget_foo(id:)
  end

  sig do
    abstract.params(id: String).
      void
  end
  def delete_widget_foo(id:)
  end
end
