# This code was generated by a tool.
# ility@{{version}}
#
# Changes to this file may cause incorrect behavior and will be lost if
# the code is regenerated.

# typed: strict

require 'typed_struct_helper'

module IlityExample::V1
  class Gizmo < T::Struct
    extend T::Sig
    include TypedStructHelper

    const :id, T.nilable(String)
    const :name, T.nilable(String)
    const :size, T.nilable(IlityExample::V1::ProductSize)
  end
end
